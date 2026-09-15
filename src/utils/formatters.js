/**
 * Indian Locale Date, Time, Number and Delta formatters.
 * Supports English ('en-IN'), Marathi ('mr-IN'), and Hindi ('hi-IN').
 */

export const LOCALE_MAP = {
  en: "en-IN",
  mr: "mr-IN",
  hi: "hi-IN",
};

export function getLocaleTag(lang = "en") {
  if (typeof lang !== "string") return "en-IN";
  const code = lang.split("-")[0];
  return LOCALE_MAP[code] || "en-IN";
}

/**
 * Resolves optional lang and digits arguments in either order:
 * (val, lang, digits) or (val, digits, lang)
 */
function resolveFormatArgs(arg1, arg2, defaultLang = "en", defaultDigits = 2) {
  let lang = defaultLang;
  let digits = defaultDigits;

  if (typeof arg1 === "number") {
    digits = arg1;
    if (typeof arg2 === "string") {
      lang = arg2;
    }
  } else if (typeof arg1 === "string") {
    lang = arg1;
    if (typeof arg2 === "number") {
      digits = arg2;
    }
  } else if (typeof arg2 === "number") {
    digits = arg2;
  } else if (typeof arg2 === "string") {
    lang = arg2;
  }

  return { lang, digits };
}

/**
 * Formats numbers using standard Indian grouping (e.g. 1,00,000).
 */
export function formatNumber(value, lang = "en", options = {}) {
  if (value === null || value === undefined || isNaN(value)) return "—";
  try {
    const localeTag = getLocaleTag(lang);
    return new Intl.NumberFormat(localeTag, options).format(value);
  } catch {
    if (typeof options?.maximumFractionDigits === "number") {
      return Number(value).toFixed(options.maximumFractionDigits);
    }
    return String(value);
  }
}

/**
 * Formats decimals (e.g., NDVI 0.58).
 * Accepts (value, lang, digits) or (value, digits, lang).
 */
export function formatDecimal(value, arg1 = "en", arg2 = 2) {
  const { lang, digits } = resolveFormatArgs(arg1, arg2, "en", 2);
  if (value === null || value === undefined || isNaN(value)) return "—";
  const num = Number(value);
  return formatNumber(num, lang, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/**
 * Formats percentage numbers (e.g., 82%).
 */
export function formatPercent(value, lang = "en") {
  if (value === null || value === undefined || isNaN(value)) return "—";
  const num = formatNumber(value, lang);
  return `${num}%`;
}

/**
 * Formats delta values with explicit '+' or '-' prefix and specified decimal places.
 * Accepts (value, lang, digits) or (value, digits, lang).
 */
export function formatDelta(value, arg1 = "en", arg2 = 2) {
  const { lang, digits } = resolveFormatArgs(arg1, arg2, "en", 2);
  if (value === null || value === undefined || isNaN(value)) {
    return Number(0).toFixed(digits);
  }
  const rawNum = Number(value);
  let roundedNum = Number(rawNum.toFixed(digits));
  if (roundedNum === 0) roundedNum = 0; // Avoid negative zero (-0)
  const sign = roundedNum > 0 ? "+" : "";
  const formatted = formatDecimal(roundedNum, lang, digits);
  return `${sign}${formatted}`;
}

/**
 * Formats dates into localized strings.
 */
export function formatDate(dateInput, lang = "en", options = { day: "2-digit", month: "short", year: "numeric" }) {
  if (!dateInput) return "—";
  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(date.getTime())) return String(dateInput);
    const localeTag = getLocaleTag(lang);
    return new Intl.DateTimeFormat(localeTag, options).format(date);
  } catch {
    return String(dateInput);
  }
}
