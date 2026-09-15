import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  MessageSquare,
  Send,
  X,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  HelpCircle,
  Database,
  CheckCircle2,
  Droplets,
  FileCheck
} from "lucide-react";
import { chatWithJalSetu } from "../api";

let msgCounter = 1;
function nextMsgId(prefix) {
  msgCounter += 1;
  return `${prefix}-${msgCounter}`;
}

export default function AskJalSetuChatbot({
  watersheds = [],
  activeWatershedId = null,
  activeInterventionId = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWatershedId, setSelectedWatershedId] = useState(
    activeWatershedId || (watersheds[0]?.id || "WGH-NK-01")
  );
  const [language, setLanguage] = useState("English");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Sync selected watershed with active watershed from app when prop changes
  const prevActiveIdRef = useRef(activeWatershedId);
  useEffect(() => {
    if (activeWatershedId && activeWatershedId !== prevActiveIdRef.current) {
      prevActiveIdRef.current = activeWatershedId;
      setSelectedWatershedId(activeWatershedId);
    }
  }, [activeWatershedId]);

  const activeWatershed = useMemo(() => {
    return (
      watersheds.find((w) => w.id === selectedWatershedId) ||
      watersheds[0] ||
      { id: "WGH-NK-01", name: "Waghad Watershed", district: "Nashik", state: "Maharashtra" }
    );
  }, [watersheds, selectedWatershedId]);

  const initialGreeting = useMemo(() => {
    if (language === "Hindi") {
      return {
        id: "init-1",
        sender: "assistant",
        text: `नमस्ते! मैं 'पूछें जल सेतु (Ask Jal Setu)' AI सहायक हूँ।\n\nमैं आपको **${activeWatershed.name} (${activeWatershed.district}, ${activeWatershed.state})** के उपग्रह संकेतकों (NDVI, जल सूचकांक), जमीनी साक्ष्यों और सत्यापन स्थिति को सरल भाषा में समझा सकता हूँ।\n\nनीचे दिए गए त्वरित प्रश्नों पर क्लिक करें या अपना प्रश्न लिखें।`,
        status: activeWatershed.assessment || "Needs Review",
        sources: [
          `जलसंभर रिकॉर्ड: ${activeWatershed.name} (${activeWatershed.id})`,
          "Sentinel-2 L2A उपग्रह प्रेक्षण",
          "क्षेत्रीय साक्ष्य रिकॉर्ड"
        ],
        recommendedAction: "आवश्यकतानुसार हालिया भू-टैग की गई तस्वीर एकत्र करें",
        timestamp: "Now"
      };
    }
    return {
      id: "init-1",
      sender: "assistant",
      text: `Hello! I am **Ask Jal Setu**, your grounded watershed monitoring assistant.\n\nI can explain satellite indicators (NDVI, Water Index), field photo readiness, and evidence fusion results for **${activeWatershed.name} (${activeWatershed.district}, ${activeWatershed.state})** in plain language.\n\nChoose a quick question below or ask your own question.`,
      status: activeWatershed.assessment || "Needs Review",
      sources: [
        `Watershed record: ${activeWatershed.name} (${activeWatershed.id})`,
        "Sentinel-2 L2A satellite observation",
        "Field evidence record"
      ],
      recommendedAction: "Review evidence gap and collect recent geo-tagged field photos if missing",
      timestamp: "Now"
    };
  }, [language, activeWatershed]);

  const [messages, setMessages] = useState([initialGreeting]);

  // Auto-scroll messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  const quickQuestions = useMemo(() => {
    if (language === "Hindi") {
      return [
        { label: "इस जलसंभर को समझाइए", query: "इस जलसंभर की वर्तमान स्थिति और निगरानी का विवरण दें" },
        { label: "NDVI का क्या अर्थ है?", query: "NDVI का क्या अर्थ है और यह क्या दर्शाता है?" },
        { label: "जल सूचकांक का क्या अर्थ है?", query: "Water Index (जल सूचकांक) का क्या अर्थ है?" },
        { label: "समीक्षा की आवश्यकता क्यों है?", query: "इस स्थल को समीक्षा की आवश्यकता क्यों है?" },
        { label: "अधिकारी आगे क्या निरीक्षण करें?", query: "अधिकारी को आगे क्या निरीक्षण करना चाहिए?" },
        { label: "मूल्यांकन का सारांश दें", query: "साक्ष्य मूल्यांकन का सारांश दें" },
      ];
    }
    return [
      { label: "Explain this watershed", query: "Explain this watershed" },
      { label: "What does NDVI mean?", query: "What does NDVI mean?" },
      { label: "What does the Water Index mean?", query: "What does the Water Index mean?" },
      { label: "Why does this site need review?", query: "Why does this site need review?" },
      { label: "What should the officer inspect next?", query: "What should the officer inspect next?" },
      { label: "Summarise the assessment", query: "Summarise the assessment" },
    ];
  }, [language]);

  async function handleSendMessage(customQuery = null) {
    const questionText = (customQuery || input).trim();
    if (!questionText || loading) return;

    if (!customQuery) {
      setInput("");
    }

    const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMessage = {
      id: nextMsgId("usr"),
      sender: "user",
      text: questionText,
      timestamp: timeString
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await chatWithJalSetu({
        question: questionText,
        watershedId: selectedWatershedId,
        interventionId: activeInterventionId || null,
        language: language,
      });

      const assistantMessage = {
        id: nextMsgId("asst"),
        sender: "assistant",
        text: response.answer || (language === "Hindi" ? "कोई उत्तर उपलब्ध नहीं है।" : "No answer available."),
        status: response.status || "Needs Review",
        sources: response.sources || [],
        recommendedAction: response.recommended_action || "",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const fallbackError = {
        id: nextMsgId("err"),
        sender: "assistant",
        text: language === "Hindi"
          ? "1. हमने क्या देखा:\nप्रणाली वर्तमान में व्यस्त है या ऑफ़लाइन है।\n\n2. इसका क्या अर्थ हो सकता है:\nस्थानीय नेटवर्क प्रतिक्रिया में विलंब हो रहा है।\n\n3. क्या पुष्टि नहीं की जा सकती:\nताजा उपग्रह संपर्क अस्थायी रूप से अनुपलब्ध है।\n\n4. अनुशंसित अगला कदम:\nकृपया कुछ क्षण बाद पुनः प्रयास करें या ऑफ़लाइन अभिलेखों की समीक्षा करें।"
          : "1. What we observed:\nTemporary backend communication delay.\n\n2. What it may mean:\nThe system is currently relying on cached offline GIS benchmarks.\n\n3. What cannot be confirmed:\nLive server sync could not be completed.\n\n4. Recommended next action:\nPlease retry your question in a moment or inspect cached records.",
        status: "Needs Review",
        sources: [`Watershed: ${activeWatershed.name}`],
        recommendedAction: "Retry inquiry or verify local records",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, fallbackError]);
    } finally {
      setLoading(false);
    }
  }

  function handleClearChat() {
    setMessages([initialGreeting]);
  }

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        type="button"
        className={`ask-jalsetu-floating-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title={language === "Hindi" ? "जल सेतु से पूछें" : "Ask Jal Setu AI Assistant"}
        aria-label="Ask Jal Setu"
      >
        <div className="btn-icon-wrapper">
          <Droplets className="droplet-sub" size={12} />
          <MessageSquare className="main-icon" size={20} />
          <span className="pulse-beacon" />
        </div>
        <span className="btn-label">
          {language === "Hindi" ? "जल सेतु से पूछें" : "Ask Jal Setu"}
        </span>
      </button>

      {/* Slide-over Chatbot Modal Panel */}
      {isOpen && (
        <div className="ask-jalsetu-panel" role="dialog" aria-modal="true" aria-labelledby="chat-title">
          {/* Header */}
          <div className="panel-header">
            <div className="header-branding">
              <div className="bot-avatar">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 id="chat-title">{language === "Hindi" ? "जल सेतु से पूछें" : "Ask Jal Setu"}</h3>
                <span className="bot-subtitle">
                  {language === "Hindi" ? "भू-स्थानिक निर्णय समर्थन" : "Grounded GIS Decision Assistant"}
                </span>
              </div>
            </div>

            <div className="header-controls">
              <button
                type="button"
                className="icon-control-btn"
                onClick={handleClearChat}
                title={language === "Hindi" ? "बातचीत रीसेट करें" : "Clear conversation"}
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                className="icon-control-btn close-btn"
                onClick={() => setIsOpen(false)}
                title={language === "Hindi" ? "बंद करें" : "Close"}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Context Controls Bar */}
          <div className="context-bar">
            {/* Watershed Selector */}
            <div className="context-select-group">
              <label htmlFor="chat-watershed-select">
                <Droplets size={13} />
                <span>{language === "Hindi" ? "जलसंभर:" : "Watershed:"}</span>
              </label>
              <select
                id="chat-watershed-select"
                value={selectedWatershedId}
                onChange={(e) => setSelectedWatershedId(e.target.value)}
              >
                {watersheds.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.district})
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selector */}
            <div className="language-toggle">
              <button
                type="button"
                className={`lang-btn ${language === "English" ? "active" : ""}`}
                onClick={() => setLanguage("English")}
              >
                EN
              </button>
              <button
                type="button"
                className={`lang-btn ${language === "Hindi" ? "active" : ""}`}
                onClick={() => setLanguage("Hindi")}
              >
                हिंदी
              </button>
            </div>
          </div>

          {/* Notice Banner */}
          <div className="evidence-notice-bar">
            <ShieldCheck size={14} />
            <span>
              {language === "Hindi"
                ? "उपलब्ध जल सेतु साक्ष्यों पर आधारित AI स्पष्टीकरण।"
                : "AI explanation based on available Jal Setu evidence."}
            </span>
          </div>

          {/* Messages Area */}
          <div className="panel-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-row ${msg.sender}`}>
                {msg.sender === "assistant" && (
                  <div className="assistant-avatar">
                    <Droplets size={14} />
                  </div>
                )}

                <div className="message-bubble">
                  {msg.sender === "assistant" && msg.status && (
                    <div className="bubble-top-meta">
                      <span className={`status-pill ${msg.status.toLowerCase().replace(/\s+/g, "-")}`}>
                        <FileCheck size={12} />
                        {msg.status}
                      </span>
                      <span className="msg-time">{msg.timestamp}</span>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="bubble-text">
                    {msg.text.split("\n\n").map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>

                  {/* Recommended Action Card (Assistant only) */}
                  {msg.sender === "assistant" && msg.recommendedAction && (
                    <div className="action-callout">
                      <div className="action-header">
                        <CheckCircle2 size={14} />
                        <strong>
                          {language === "Hindi" ? "अनुशंसित अगला कदम" : "Recommended Action"}
                        </strong>
                      </div>
                      <p>{msg.recommendedAction}</p>
                    </div>
                  )}

                  {/* Sources List */}
                  {msg.sender === "assistant" && msg.sources && msg.sources.length > 0 && (
                    <div className="sources-container">
                      <div className="sources-label">
                        <Database size={12} />
                        <span>{language === "Hindi" ? "साक्ष्य स्रोत" : "Evidence Sources"}</span>
                      </div>
                      <div className="sources-chips">
                        {msg.sources.map((source, sIdx) => (
                          <span key={sIdx} className="source-chip" title={source}>
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.sender === "user" && (
                    <div className="user-time-meta">{msg.timestamp}</div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="message-row assistant">
                <div className="assistant-avatar">
                  <Droplets size={14} />
                </div>
                <div className="message-bubble loading-bubble">
                  <div className="loading-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <small>
                    {language === "Hindi"
                      ? "जल सेतु साक्ष्यों का विश्लेषण किया जा रहा है..."
                      : "Grounding answer in Jal Setu evidence..."}
                  </small>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick-Question Buttons */}
          <div className="quick-questions-wrapper">
            <span className="quick-label">
              <HelpCircle size={12} />
              {language === "Hindi" ? "त्वरित प्रश्न:" : "Quick Questions:"}
            </span>
            <div className="quick-chips-scroll">
              {quickQuestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="quick-chip"
                  disabled={loading}
                  onClick={() => handleSendMessage(item.query)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box and Send Form */}
          <form
            className="panel-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <div className="input-wrapper">
              <input
                type="text"
                value={input}
                maxLength={500}
                placeholder={
                  language === "Hindi"
                    ? "इस जलसंभर के बारे में प्रश्न पूछें..."
                    : "Ask a question about this watershed in simple language..."
                }
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className="send-btn"
                disabled={!input.trim() || loading}
                title={language === "Hindi" ? "संदेश भेजें" : "Send message"}
              >
                <Send size={16} />
              </button>
            </div>
            <div className="input-meta-bar">
              <small className="char-count">{input.length}/500</small>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
