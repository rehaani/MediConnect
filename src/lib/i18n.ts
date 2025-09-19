
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Simple translation resources.
// In a real app, you'd likely load these from JSON files.
const resources = {
  en: {
    translation: {
      "Dashboard": "Dashboard",
      "Welcome back, {{name}}. Here's your personalized view.": "Welcome back, {{name}}. Here's your personalized view.",
      "Live Location": "Live Location",
      "Your current location for emergency services and language preferences.": "Your current location for emergency services and language preferences.",
      "Emergency Contacts": "Emergency Contacts",
      "Your designated contacts for emergency situations.": "Your designated contacts for emergency situations.",
      "Region": "Region",
      "Your detected region for language and service personalization.": "Your detected region for language and service personalization.",
      "LanguageSuggestion": "It looks like you're in a region where {{langName}} is spoken. Would you like to switch?",
      "Language Suggestion": "Language Suggestion",
      "Switch": "Switch"
    }
  },
  hi: {
    translation: {
      "Dashboard": "डैशबोर्ड",
      "Welcome back, {{name}}. Here's your personalized view.": "वापसी पर स्वागत है, {{name}}। यहाँ आपका व्यक्तिगत दृश्य है।",
      "Live Location": "लाइव लोकेशन",
      "Your current location for emergency services and language preferences.": "आपातकालीन सेवाओं और भाषा वरीयताओं के लिए आपका वर्तमान स्थान।",
      "Emergency Contacts": "आपातकालीन संपर्क",
      "Your designated contacts for emergency situations.": "आपातकालीन स्थितियों के लिए आपके निर्दिष्ट संपर्क।",
      "Region": "क्षेत्र",
      "Your detected region for language and service personalization.": "भाषा और सेवा वैयक्तिकरण के लिए आपका पता लगाया गया क्षेत्र।",
      "LanguageSuggestion": "ऐसा लगता है कि आप एक ऐसे क्षेत्र में हैं जहाँ {{langName}} बोली जाती है। क्या आप स्विच करना चाहेंगे?",
      "Language Suggestion": "भाषा सुझाव",
      "Switch": "स्विच"
    }
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(LanguageDetector) // detect user language
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    },
    detection: {
      order: ['localStorage', 'navigator'],
    }
  });

export default i18n;
