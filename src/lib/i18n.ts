
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
      "Switch": "Switch",
      "AI Health Assessor": "AI Health Assessor",
      "Document Analysis": "Document Analysis",
      "Upload up to 5 documents (images or PDFs, max 5MB each) and ask a specific question.": "Upload up to 5 documents (images or PDFs, max 5MB each) and ask a specific question.",
      "Select Patient": "Select Patient",
      "Select a patient to analyze documents for...": "Select a patient to analyze documents for...",
      "Your Documents": "Your Documents",
      "Select one or more files to analyze.": "Select one or more files to analyze.",
      "You can upload a maximum of 5 documents.": "You can upload a maximum of 5 documents.",
      "Uploaded Files": "Uploaded Files",
      "Your Question": "Your Question",
      "e.g., What is the dosage for this medication? Are there any potential side effects mentioned?": "e.g., What is the dosage for this medication? Are there any potential side effects mentioned?",
      "Analyze Documents": "Analyze Documents",
      "AI is analyzing your documents...": "AI is analyzing your documents...",
      "(This may take a moment, especially for PDFs)": "(This may take a moment, especially for PDFs)",
      "AI Document Analysis": "AI Document Analysis",
      "Summary": "Summary",
      "Details": "Details",
      "Recommendation": "Recommendation",
      "Disclaimer: This AI analysis is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.": "Disclaimer: This AI analysis is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.",
      "Start New Analysis": "Start New Analysis",
      "Analysis Error": "Analysis Error",
      "An error occurred while analyzing your documents. The AI model may have been unable to process the request. Please try again.": "An error occurred while analyzing your documents. The AI model may have been unable to process the request. Please try again.",
      "Analysis History": "Analysis History",
      "Review past document analyses.": "Review past document analyses.",
      "No analysis history found for this patient.": "No analysis history found for this patient.",
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
      "LanguageSuggestion": " ऐसा लगता है कि आप एक ऐसे क्षेत्र में हैं जहाँ {{langName}} बोली जाती है। क्या आप स्विच करना चाहेंगे?",
      "Language Suggestion": "भाषा सुझाव",
      "Switch": "स्विच",
      "AI Health Assessor": "एआई स्वास्थ्य मूल्यांकनकर्ता",
    }
  },
  de: {
    translation: {
      "Dashboard": "Instrumententafel",
      "Welcome back, {{name}}. Here's your personalized view.": "Willkommen zurück, {{name}}. Hier ist Ihre personalisierte Ansicht.",
      "Live Location": "Live-Standort",
      "Your current location for emergency services and language preferences.": "Ihr aktueller Standort für Notdienste und Spracheinstellungen.",
      "Emergency Contacts": "Notfallkontakte",
      "Your designated contacts for emergency situations.": "Ihre benannten Ansprechpartner für Notfallsituationen.",
      "Region": "Region",
      "Your detected region for language and service personalization.": "Ihre erkannte Region für Sprach- und Dienstanpassung.",
      "LanguageSuggestion": "Es scheint, dass Sie sich in einer Region befinden, in der {{langName}} gesprochen wird. Möchten Sie wechseln?",
      "Language Suggestion": "Sprachvorschlag",
      "Switch": "Wechseln",
      "AI Health Assessor": "KI-Gesundheits-Assessor",
      "Document Analysis": "Dokumentenanalyse",
      "Upload up to 5 documents (images or PDFs, max 5MB each) and ask a specific question.": "Laden Sie bis zu 5 Dokumente (Bilder oder PDFs, max. 5 MB pro Stück) hoch und stellen Sie eine spezifische Frage.",
      "Select Patient": "Patient auswählen",
      "Select a patient to analyze documents for...": "Wählen Sie einen Patienten aus, für den Dokumente analysiert werden sollen...",
      "Your Documents": "Ihre Dokumente",
      "Select one or more files to analyze.": "Wählen Sie eine oder mehrere Dateien zur Analyse aus.",
      "You can upload a maximum of 5 documents.": "Sie können maximal 5 Dokumente hochladen.",
      "Uploaded Files": "Hochgeladene Dateien",
      "Your Question": "Ihre Frage",
      "e.g., What is the dosage for this medication? Are there any potential side effects mentioned?": "z.B. Wie ist die Dosierung für dieses Medikament? Werden mögliche Nebenwirkungen erwähnt?",
      "Analyze Documents": "Dokumente analysieren",
      "AI is analyzing your documents...": "Die KI analysiert Ihre Dokumente...",
      "(This may take a moment, especially for PDFs)": "(Dies kann einen Moment dauern, insbesondere bei PDFs)",
      "AI Document Analysis": "KI-Dokumentenanalyse",
      "Summary": "Zusammenfassung",
      "Details": "Details",
      "Recommendation": "Empfehlung",
      "Disclaimer: This AI analysis is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.": "Haftungsausschluss: Diese KI-Analyse dient nur zu Informationszwecken und ist kein Ersatz für professionelle medizinische Beratung, Diagnose oder Behandlung.",
      "Start New Analysis": "Neue Analyse starten",
      "Analysis Error": "Analysefehler",
      "An error occurred while analyzing your documents. The AI model may have been unable to process the request. Please try again.": "Bei der Analyse Ihrer Dokumente ist ein Fehler aufgetreten. Das KI-Modell konnte die Anfrage möglicherweise nicht verarbeiten. Bitte versuchen Sie es erneut.",
      "Analysis History": "Analyse-Verlauf",
      "Review past document analyses.": "Überprüfen Sie frühere Dokumentenanalysen.",
      "No analysis history found for this patient.": "Für diesen Patienten wurde kein Analyse-Verlauf gefunden.",
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
