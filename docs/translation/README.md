# Translation (i18next)

### 1. Introduction
i18next is a powerful and popular internationalization (i18n) framework for JavaScript. It provides a complete solution to localize products, from web to mobile and beyond. In MediConnect, it is used to translate the application's UI into multiple languages, making it accessible to a broader, non-English-speaking audience.

### 2. Integration in MediConnect
- **Configuration (`src/lib/i18n.ts`)**: The central i18next configuration is located in this file. It defines:
    - **Supported Languages**: `en` (English), `hi` (Hindi), and `de` (German).
    - **Translation Resources**: The actual translation strings are stored directly in this file in a `resources` object. In a larger application, these would typically be loaded from separate JSON files per language.
    - **Language Detector**: It is configured to use `i18next-browser-languagedetector`, which automatically detects the user's language preference in a specific order: first from `localStorage`, then from the browser's `navigator` object.
    - **Fallback Language**: 'en' is set as the fallback language if a translation key is missing in the current language.
- **Provider (`src/context/i18n-provider.tsx`)**: The `I18nProvider` component wraps the entire application in `src/app/layout.tsx`. This makes the i18n instance and translation capabilities available to all components throughout the app via React's Context API.
- **Usage in Components**: The `useTranslation` hook from `react-i18next` is used within components to access the translation function `t()`. Components then use `t('key')` to render translated strings.
- **Language Toggle Component (`src/components/layout/language-toggle.tsx`)**: A dropdown menu component that allows the user to manually switch the language. When a language is selected, it calls `i18n.changeLanguage()` and also attempts to save this preference to the (mock) user's profile.
- **Dynamic Language Suggestion**: The `PatientDashboard` component integrates with the Leaflet map feature. After finding the user's country via reverse geocoding, it can proactively suggest switching to the local language if it's different from the currently active one (e.g., suggest Hindi if the user is in India but the app is in English). This is handled via a toast notification with a "Switch" action.

### 3. Benefits
- **Global Reach**: Makes the application usable for non-English speakers, which is critical for a healthcare app aiming to serve diverse communities.
- **Flexible and Extensible**: New languages can be easily added by updating the `resources` object in the configuration file.
- **Automatic Detection**: Provides a seamless experience for first-time users by automatically selecting their preferred language based on browser settings.
- **Context-Aware Suggestions**: The integration with location services makes the app feel more intelligent and personalized by suggesting relevant languages.

### 4. Flowchart
```mermaid
flowchart TD
  A[App Loads] --> B{i18next provider initializes in layout.tsx}
  B --> C[LanguageDetector checks for language in localStorage, then navigator]
  C --> D[Sets initial language (e.g., 'de' if browser is German)]
  D --> E[Components render using the t() function with translated German text]

  subgraph "Manual Language Switch"
    F{User clicks LanguageToggle dropdown} --> G[Selects "Hindi"]
    G --> H[i18n.changeLanguage('hi') is called]
    H --> I[Language is saved to localStorage and UI re-renders with Hindi text]
    I --> D
  end
  
  subgraph "Automatic Suggestion"
    J[Patient dashboard detects user is in India] --> K{Toast notification suggests switching to Hindi}
    K --> L{User clicks "Switch" on toast}
    L --> H
  end
```

### 5. Key Code Snippets
**i18n Configuration (`i18n.ts`):**
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: { translation: { "Dashboard": "Dashboard" } },
  hi: { translation: { "Dashboard": "डैशबोर्ड" } },
  de: { translation: { "Dashboard": "Instrumententafel" } }
};

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'], // Defines priority for detection
    }
  });

export default i18n;
```

**Using the `useTranslation` Hook in a Component:**
```javascript
// In a React component
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  return <h1>{t('Dashboard')}</h1>; // Renders "Dashboard", "डैशबोर्ड", or "Instrumententafel"
};
```

### 6. Testing Instructions
1.  **Manual Language Switch**: Click the language toggle button (globe icon) in the UI and select "हिंदी (Hindi)". Verify that the dashboard title and other text elements change to Hindi.
2.  **Automatic Detection**: Clear your browser's site data for the application to remove any saved language preference. Set your browser's primary language to German. Reload the application. Verify that the UI automatically loads in German.
3.  **Location-based Suggestion**: On the patient dashboard, if your location is detected as being in India (you may need a VPN or browser location spoofer to simulate this), verify that a toast notification appears suggesting you to switch to Hindi. Click the "Switch" button on the toast and confirm the language changes.
