import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check, ChevronDown } from "lucide-react";

const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी", flag: "🇮🇳" },
];

export default function LanguageSwitcher({ variant = "header" }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize current language code (e.g. 'mr-IN' -> 'mr')
  const currentCode = (i18n.language || "en").split("-")[0];
  const activeLang = LANGUAGES.find((l) => l.code === currentCode) || LANGUAGES[0];

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
    try {
      localStorage.setItem("jalsetu_lang", code);
    } catch {
      // ignore
    }
    setOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  if (variant === "inline") {
    return (
      <div className="lang-switcher-inline">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            className={`lang-inline-btn ${activeLang.code === lang.code ? "active" : ""}`}
            onClick={() => handleLanguageChange(lang.code)}
          >
            <span>{lang.nativeName}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="lang-switcher-wrapper" ref={containerRef}>
      <button
        type="button"
        className={`lang-switcher-btn ${open ? "open" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Select Language"
        title="Change language / भाषा बदला"
      >
        <Globe size={16} className="lang-globe-icon" />
        <span className="lang-current-label">{activeLang.nativeName}</span>
        <ChevronDown size={14} className={`lang-chevron ${open ? "rotate" : ""}`} />
      </button>

      {open && (
        <div className="lang-dropdown-menu">
          <div className="lang-dropdown-header">
            <span>Select Language / भाषा</span>
          </div>

          <div className="lang-dropdown-list">
            {LANGUAGES.map((lang) => {
              const isSelected = activeLang.code === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  className={`lang-dropdown-item ${isSelected ? "selected" : ""}`}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  <div className="lang-item-text">
                    <span className="lang-native-name">{lang.nativeName}</span>
                    <span className="lang-en-name">{lang.name}</span>
                  </div>
                  {isSelected && <Check size={16} className="lang-check-icon" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
