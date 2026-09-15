"""
LLM Provider Abstraction for Ask Jal Setu.

Supports:
1. Ollama (default local provider using official /api/chat interface)
2. OpenAI-compatible hosted provider (via OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL)
3. Grounded RuleBasedExplainer fallback (when LLM is unavailable, offline, or returns error)

Enforces strict 4-part structure:
1. What we observed
2. What it may mean
3. What cannot be confirmed
4. Recommended next action
"""

import os
import json
import logging
import urllib.request
import urllib.error
from typing import Dict, Any, Optional

logger = logging.getLogger("jalsetu.llm")

SYSTEM_PROMPT = """You are Ask Jal Setu, an assistant for watershed monitoring.

Explain the provided watershed information to a non-technical user in simple,
clear language. Respond in the selected language.

Use only the supplied Jal Setu context. Never invent values, dates, locations,
data sources or conclusions. If the information is missing, say:
“This information is not available in the current records.”

Structure every answer as:

1. What we observed
2. What it may mean
3. What cannot be confirmed
4. Recommended next action

Explain technical terms such as NDVI, Water Index, rainfall and satellite
resolution in everyday language.

Satellite observations are supporting evidence, not proof that an individual
intervention caused an environmental change. At 30-metre resolution, small
ponds, trenches, bunds and check dams may not be directly resolvable.

Use these evidence labels where appropriate:
- Directly visible
- Contextually supported
- Not resolvable

Respect the existing statuses:
- Verified
- Needs Review
- Inconclusive

The chatbot supports officer review; it must never automatically approve an
intervention or replace the authorised officer."""


class RuleBasedExplainer:
    """
    Intelligent grounded fallback generator.
    Produces strictly structured, factual 4-part explanations in English or Hindi
    using only the provided Jal Setu records without inventing information.
    """

    @staticmethod
    def generate(context: Dict[str, Any], question: str, language: str = "English") -> str:
        is_hindi = language.strip().lower() == "hindi"
        q_lower = question.strip().lower()

        # Handle missing watershed
        if not context or not context.get("found"):
            if is_hindi:
                return (
                    "1. हमने क्या देखा:\n"
                    "यह जानकारी वर्तमान अभिलेखों में उपलब्ध नहीं है। निर्दिष्ट जलसंभर प्रणाली में नहीं मिला।\n\n"
                    "2. इसका क्या अर्थ हो सकता है:\n"
                    "इस नाम या कोड से संबंधित कोई सक्रिय निगरानी डेटा उपलब्ध नहीं है।\n\n"
                    "3. क्या पुष्टि नहीं की जा सकती:\n"
                    "बिना मान्य अभिलेख के उपग्रह या जमीनी स्थिति की पुष्टि नहीं की जा सकती।\n\n"
                    "4. अनुशंसित अगला कदम:\n"
                    "कृपया जलसंभर सूची से मान्य जलसंभर का चयन करें या निगरानी कोड की जांच करें।"
                )
            return (
                "1. What we observed:\n"
                "This information is not available in the current records. The requested watershed could not be identified.\n\n"
                "2. What it may mean:\n"
                "There is no active monitoring record or baseline data available for this identifier.\n\n"
                "3. What cannot be confirmed:\n"
                "Satellite vegetation indicators, water index and field evidence cannot be confirmed without a valid record.\n\n"
                "4. Recommended next action:\n"
                "Please select a valid watershed unit from the inventory or check the watershed code."
            )

        # Extract verified context
        name = context.get("name", "Watershed")
        w_id = context.get("watershed_id", "")
        district = context.get("district", "")
        state = context.get("state", "")
        structure = context.get("structure", "Intervention structure")
        status = context.get("status", "Needs Review")
        confidence = context.get("confidence", 75)
        ndvi = context.get("ndvi", 0.50)
        base_ndvi = context.get("base_ndvi")
        ndvi_change = context.get("ndvi_change")
        water = context.get("water_index", 0.50)
        base_water = context.get("base_water")
        water_change = context.get("water_change")
        rainfall = context.get("rainfall", "N/A")
        obs_date = context.get("observation_date", "08 Sep 2026")
        field_photo = context.get("field_photo_available", False)
        gps_avail = context.get("gps_available", False)
        gap = context.get("evidence_gap", 20)
        recommended_action = context.get("recommended_action", "Collect a recent geo-tagged field photograph")
        review_reason = context.get("review_reason", "Verification required")

        # Specific Question Handling
        # 1. NDVI explanation
        if "ndvi" in q_lower:
            if is_hindi:
                delta_str = f"+{ndvi_change:.2f}" if (ndvi_change is not None and ndvi_change >= 0) else (f"{ndvi_change:.2f}" if ndvi_change is not None else "एन/ए")
                return (
                    f"1. हमने क्या देखा:\n"
                    f"{name} ({district}, {state}) का वर्तमान NDVI मान {ndvi:.2f} दर्ज किया गया है (आधार रेखा: {base_ndvi if base_ndvi is not None else 'एन/ए'}, परिवर्तन: {delta_str})। उपग्रह अवलोकन तिथि {obs_date} (Sentinel-2) है।\n\n"
                    f"2. इसका क्या अर्थ हो सकता है:\n"
                    f"NDVI (सामान्यीकृत अंतर वनस्पति सूचकांक) उपग्रह से पौधों की हरियाली और स्वास्थ्य को मापता है। यह मान 0 से 1 के बीच होता है, जहां उच्च मान सघन व स्वस्थ वनस्पति दर्शाते हैं। यहां का संकेत 'संदर्भ के रूप में समर्थित (Contextually supported)' श्रेणी में है।\n\n"
                    f"3. क्या पुष्टि नहीं की जा सकती:\n"
                    f"उपग्रह का 30-मीटर रिज़ॉल्यूशन यह साबित नहीं करता कि हरियाली में हुआ परिवर्तन विशेष रूप से {structure} के कारण ही हुआ है। व्यक्तिगत हस्तक्षेप के सटीक प्रभाव को उपग्रह से अलग नहीं किया जा सकता।\n\n"
                    f"4. अनुशंसित अगला कदम:\n"
                    f"{recommended_action}।"
                )
            delta_str = f"+{ndvi_change:.2f}" if (ndvi_change is not None and ndvi_change >= 0) else (f"{ndvi_change:.2f}" if ndvi_change is not None else "N/A")
            return (
                f"1. What we observed:\n"
                f"In {name} ({district}, {state}), the current NDVI is recorded as {ndvi:.2f} (baseline: {base_ndvi if base_ndvi is not None else 'N/A'}, delta: {delta_str}). The observation date is {obs_date} from Sentinel-2.\n\n"
                f"2. What it may mean:\n"
                f"NDVI (Normalized Difference Vegetation Index) measures green biomass and vegetation vigour from satellite bands. Values range from 0 to 1, with higher scores indicating healthier vegetation canopy. The current trend is Contextually supported by regional catchment conditions.\n\n"
                f"3. What cannot be confirmed:\n"
                f"At 30-metre resolution, satellite observations provide surrounding landscape context but cannot confirm that this individual {structure} directly caused the vegetation change.\n\n"
                f"4. Recommended next action:\n"
                f"{recommended_action}."
            )

        # 2. Water Index explanation
        if "water index" in q_lower or "water" in q_lower and ("mean" in q_lower or "arth" in q_lower):
            if is_hindi:
                w_delta_str = f"+{water_change:.2f}" if (water_change is not None and water_change >= 0) else (f"{water_change:.2f}" if water_change is not None else "एन/ए")
                return (
                    f"1. हमने क्या देखा:\n"
                    f"{name} के लिए जल सूचकांक (Water Index / NDWI) {water:.2f} दर्ज है (आधार रेखा: {base_water if base_water is not None else 'एन/ए'}, बदलाव: {w_delta_str})। मौसमी वर्षा {rainfall} मिमी रही है।\n\n"
                    f"2. इसका क्या अर्थ हो सकता है:\n"
                    f"जल सूचकांक उपग्रह से खुली जल सतहों और नमी को ट्रैक करता है। वर्तमान मान जलग्रहण क्षेत्र में नमी की उपस्थिति को दर्शाता है।\n\n"
                    f"3. क्या पुष्टि नहीं की जा सकती:\n"
                    f"30-मीटर उपग्रह डेटा पर छोटे तालाब, बंधारे या खाई (trenches) 'रिज़ॉल्व नहीं किए जा सकते (Not resolvable)'। उपग्रह से पानी की मौजूदगी दिख सकती है, परंतु संरचना की भौतिक अखंडता या रिसाव की पुष्टि नहीं हो सकती।\n\n"
                    f"4. अनुशंसित अगला कदम:\n"
                    f"{recommended_action}।"
                )
            w_delta_str = f"+{water_change:.2f}" if (water_change is not None and water_change >= 0) else (f"{water_change:.2f}" if water_change is not None else "N/A")
            return (
                f"1. What we observed:\n"
                f"For {name}, the current Water Index (NDWI) is {water:.2f} (baseline: {base_water if base_water is not None else 'N/A'}, delta: {w_delta_str}), with seasonal rainfall recorded at {rainfall} mm.\n\n"
                f"2. What it may mean:\n"
                f"The Water Index tracks surface water presence and moisture retention from satellite spectral bands. It indicates overall catchment moisture availability.\n\n"
                f"3. What cannot be confirmed:\n"
                f"At 30-metre resolution, small ponds, trenches, and check dams are Not resolvable. Satellite data cannot confirm physical water retention behind the structure or prove causation.\n\n"
                f"4. Recommended next action:\n"
                f"{recommended_action}."
            )

        # 3. Why does this site need review / Inconclusive?
        if "need review" in q_lower or "review" in q_lower or "inconclusive" in q_lower or "समीक्षा" in q_lower:
            field_note = "जमीनी तस्वीर उपलब्ध है" if field_photo else "जमीनी तस्वीर अनुपलब्ध है"
            gps_note = "GPS मेटाडेटा उपलब्ध है" if gps_avail else "GPS मेटाडेटा अनुपलब्ध है"
            field_note_en = "Field photograph is on record" if field_photo else "Recent field photograph is missing"
            gps_note_en = "GPS coordinates are verified" if gps_avail else "Verified GPS metadata is missing"

            if is_hindi:
                return (
                    f"1. हमने क्या देखा:\n"
                    f"{name} ({w_id}) की वर्तमान स्थिति '{status}' है। विश्वास स्कोर {confidence}% है और साक्ष्य अंतर {gap}% दर्ज किया गया है। {field_note} तथा {gps_note}।\n\n"
                    f"2. इसका क्या अर्थ हो सकता है:\n"
                    f"उपग्रह डेटा परिदृश्य-स्तरीय जानकारी देता है, लेकिन साक्ष्य संलयन (Evidence Fusion) के अनुसार: {review_reason}।\n\n"
                    f"3. क्या पुष्टि नहीं की जा सकती:\n"
                    f"30-मीटर उपग्रह रिज़ॉल्यूशन से छोटी संरचना ({structure}) प्रत्यक्ष रूप से दिखाई नहीं देती (Not resolvable)। इसलिए बिना हालिया भू-टैग फोटो के संरचना की वास्तविक स्थिति की पुष्टि नहीं हो सकती।\n\n"
                    f"4. अनुशंसित अगला कदम:\n"
                    f"{recommended_action}।"
                )
            return (
                f"1. What we observed:\n"
                f"{name} ({w_id}) holds the evidence status '{status}' with a confidence score of {confidence}% and an evidence gap of {gap}%. {field_note_en}, and {gps_note_en}.\n\n"
                f"2. What it may mean:\n"
                f"The field record and satellite observation provide supporting indicators, but {review_reason}. Complete evidence fusion requires direct field confirmation.\n\n"
                f"3. What cannot be confirmed:\n"
                f"At 30-metre resolution, the small {structure} is Not resolvable. The satellite image provides surrounding landscape information, but it cannot confirm the physical condition or operational status of the structure.\n\n"
                f"4. Recommended next action:\n"
                f"{recommended_action}."
            )

        # 4. What should the officer inspect next?
        if "inspect" in q_lower or "officer" in q_lower or "निरीक्षण" in q_lower or "अधिकारी" in q_lower:
            if is_hindi:
                return (
                    f"1. हमने क्या देखा:\n"
                    f"{name} ({district}, {state}) में प्राथमिक संरचना '{structure}' है और साक्ष्य अंतराल {gap}% है। स्थिति: '{status}'।\n\n"
                    f"2. इसका क्या अर्थ हो सकता है:\n"
                    f"अनुकूली सर्वेक्षण योजनाकार (Adaptive Survey Planner) इस स्थल को प्राथमिकता क्रम में रखता है ताकि अधिकारी आवश्यक साक्ष्य जुटा सकें।\n\n"
                    f"3. क्या पुष्टि नहीं की जा सकती:\n"
                    f"संरचना में गाद जमाव (siltation), रिसाव, या भौतिक क्षति को 30-मीटर उपग्रह डेटा से नहीं देखा जा सकता।\n\n"
                    f"4. अनुशंसित अगला कदम:\n"
                    f"{recommended_action}। अधिकारी को संरचना की स्थिति, जल स्तर और समय-मुद्रांकित भू-टैग तस्वीर एकत्र करनी चाहिए।"
                )
            return (
                f"1. What we observed:\n"
                f"{name} ({district}, {state}) features a primary {structure} with an evidence gap of {gap}%. Status is '{status}'.\n\n"
                f"2. What it may mean:\n"
                f"The Adaptive Survey Planner flags this unit for field verification so that missing visual or GPS evidence can be substantiated by an authorized officer.\n\n"
                f"3. What cannot be confirmed:\n"
                f"Structural siltation, embankment integrity, or maintenance issues are Not resolvable in 30-metre satellite imagery.\n\n"
                f"4. Recommended next action:\n"
                f"{recommended_action}. The inspecting officer should record structure condition, water storage depth, and a time-stamped geo-tagged photograph."
            )

        # 5. Summarise the assessment / Explain this watershed (Default comprehensive structure)
        if is_hindi:
            change_str = context.get("change", "मध्यम सुधार")
            return (
                f"1. हमने क्या देखा:\n"
                f"{name} ({district}, {state}): वर्तमान NDVI {ndvi:.2f}, जल सूचकांक {water:.2f}, मौसमी वर्षा {rainfall} मिमी। अवलोकन तिथि {obs_date}। प्राथमिक संरचना: {structure}। समग्र साक्ष्य स्थिति '{status}' है ({confidence}% विश्वास)।\n\n"
                f"2. इसका क्या अर्थ हो सकता है:\n"
                f"क्षेत्रीय परिदृश्य में '{change_str}' के संकेत हैं, जो परिवेशीय रूप से समर्थित (Contextually supported) हैं।\n\n"
                f"3. क्या पुष्टि नहीं की जा सकती:\n"
                f"उपग्रह डेटा 30-मीटर रिज़ॉल्यूशन पर है; यह व्यक्तिगत संरचना के कार्यप्रणाली का प्रत्यक्ष प्रमाण नहीं है। उपग्रह परिवर्तन और व्यक्तिगत हस्तक्षेप के बीच कार्य-कारण संबंध (causation) की पुष्टि केवल उपग्रह से नहीं हो सकती।\n\n"
                f"4. अनुशंसित अगला कदम:\n"
                f"{recommended_action}।"
            )

        change_str = context.get("change", "Moderate improvement")
        return (
            f"1. What we observed:\n"
            f"{name} ({district}, {state}) shows NDVI of {ndvi:.2f}, Water Index of {water:.2f}, and seasonal rainfall of {rainfall} mm on {obs_date}. Primary structure is {structure}. Current evidence fusion status is '{status}' with {confidence}% confidence.\n\n"
            f"2. What it may mean:\n"
            f"The catchment demonstrates {change_str}, which is Contextually supported by seasonal monitoring records.\n\n"
            f"3. What cannot be confirmed:\n"
            f"Satellite observations at 30-metre resolution provide supporting evidence but cannot resolve small structures or prove that this specific intervention caused the observed environmental change.\n\n"
            f"4. Recommended next action:\n"
            f"{recommended_action}."
        )


class OllamaProvider:
    """Official Ollama chat interface provider."""

    def __init__(self, base_url: str = "http://localhost:11434", model: str = "llama3.2"):
        self.base_url = base_url.rstrip("/")
        self.model = model

    def chat(self, prompt: str, system_prompt: str = SYSTEM_PROMPT) -> Optional[str]:
        url = f"{self.base_url}/api/chat"
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "stream": False,
            "options": {
                "temperature": 0.2
            }
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )

        try:
            with urllib.request.urlopen(req, timeout=8) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode("utf-8"))
                    message = data.get("message", {})
                    content = message.get("content")
                    if content and content.strip():
                        return content.strip()
        except Exception as err:
            logger.info("Ollama chat interface unavailable: %s", err)

        return None


class OpenAIProvider:
    """Hosted OpenAI-compatible chat completions provider."""

    def __init__(self, api_key: str, base_url: str = "https://api.openai.com/v1", model: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.model = model

    def chat(self, prompt: str, system_prompt: str = SYSTEM_PROMPT) -> Optional[str]:
        url = f"{self.base_url}/chat/completions"
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
        )

        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode("utf-8"))
                    choices = data.get("choices", [])
                    if choices:
                        content = choices[0].get("message", {}).get("content")
                        if content and content.strip():
                            return content.strip()
        except Exception as err:
            logger.info("OpenAI provider error: %s", err)

        return None


def get_llm_response(context: Dict[str, Any], question: str, language: str = "English") -> str:
    """
    Main entry point for generating answers.
    1. Checks configured LLM_PROVIDER ('ollama' or 'openai').
    2. Builds grounded prompt with strict context.
    3. Attempts provider call.
    4. If provider fails or is unavailable, immediately falls back to RuleBasedExplainer.
    """
    provider_name = os.getenv("LLM_PROVIDER", "ollama").strip().lower()

    # Formulate contextual user prompt
    context_str = json.dumps(context, indent=2, ensure_ascii=False)
    user_prompt = (
        f"Language: {language}\n"
        f"User Question: {question}\n\n"
        f"Jal Setu Context Data:\n{context_str}\n\n"
        "Remember: Use only the supplied Jal Setu context. Never invent values. "
        "Structure answer into: 1. What we observed, 2. What it may mean, 3. What cannot be confirmed, 4. Recommended next action. "
        "Preserve the 30-metre resolution limitation and explain that satellite observation does not prove individual causation."
    )

    llm_output = None

    if provider_name == "openai":
        api_key = os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY")
        if api_key:
            base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
            model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
            provider = OpenAIProvider(api_key=api_key, base_url=base_url, model=model)
            llm_output = provider.chat(prompt=user_prompt)
    elif provider_name == "ollama":
        base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        model = os.getenv("OLLAMA_MODEL", "llama3.2")
        provider = OllamaProvider(base_url=base_url, model=model)
        llm_output = provider.chat(prompt=user_prompt)

    if llm_output and llm_output.strip():
        return llm_output.strip()

    # Rule-based fallback
    return RuleBasedExplainer.generate(context=context, question=question, language=language)
