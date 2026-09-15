import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./locales/en/common.json";
import enNav from "./locales/en/nav.json";
import enWatershed from "./locales/en/watershed.json";
import enReports from "./locales/en/reports.json";

import mrCommon from "./locales/mr/common.json";
import mrNav from "./locales/mr/nav.json";
import mrWatershed from "./locales/mr/watershed.json";
import mrReports from "./locales/mr/reports.json";

import hiCommon from "./locales/hi/common.json";
import hiNav from "./locales/hi/nav.json";
import hiWatershed from "./locales/hi/watershed.json";
import hiReports from "./locales/hi/reports.json";

const resources = {
  en: {
    common: enCommon,
    nav: enNav,
    watershed: enWatershed,
    reports: enReports,
  },
  mr: {
    common: mrCommon,
    nav: mrNav,
    watershed: mrWatershed,
    reports: mrReports,
  },
  hi: {
    common: hiCommon,
    nav: hiNav,
    watershed: hiWatershed,
    reports: hiReports,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    defaultNS: "common",
    ns: ["common", "nav", "watershed", "reports"],
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "jalsetu_lang",
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false, // React already protects against XSS
    },
    react: {
      useSuspense: false,
    },
  });

// Synchronize HTML document attributes with selected language
const syncDocumentLang = (lng) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = lng || "en";
  }
};

syncDocumentLang(i18n.language || "en");
i18n.on("languageChanged", syncDocumentLang);

export default i18n;
