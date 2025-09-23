# Translation (i18next)

### 1. Introduction
i18next is a powerful internationalization framework for JavaScript. It provides a complete solution to localize products, from web to mobile and beyond. In MediConnect, it is used to translate the application's UI into multiple languages, making it accessible to a broader audience.

### 2. Integration in MediConnect
- **Configuration**: The i18next configuration is located in `src/lib/i18n.ts`. It defines the supported languages (`en`, `hi`, `de`), loads the translation resources, and sets up the language detector.
- **Provider**: The `I18nProvider` (`src/context/i18n-provider.tsx`) wraps the entire application in `src/app/layout.tsx`, making the i18n instance available to all components.
- **Language Detection**: It uses `i18next-browser-languagedetector` to automatically detect the user's language preference from their browser settings or `localStorage`.
- **Usage**: The `useTranslation` hook is used in components to access the translation function `t()`.
- **Dynamic Suggestions**: The `PatientDashboard` component integrates with the Leaflet map. After finding the user's country via reverse geocoding, it can suggest switching to the local language if it's different from the current one.

### 3. Benefits
- **Global Reach**: Makes the application usable for non-English speakers.
- **Flexible**: Easily add new languages by adding new resource files.
- **Context-Aware**: Can suggest languages based on the user's geographical location.
- **Standardized**: Follows industry standards for internationalization.

### 4. Flowchart
```mermaid
flowchart TD
  A[App Loads] --> B{i18next initializes}
  B --> C[LanguageDetector checks localStorage/browser settings]
  C --> D[Sets initial language]
  D --> E[Components render with translated text]

  subgraph "Language Switch"
    F{User clicks LanguageToggle} --> G[Calls i18n.changeLanguage()]
    G --> D
    H{User accepts location-based suggestion} --> G
  end
```

### 5. Key Code Snippets
**i18n Configuration (`i18n.ts`):**
```typescript
i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources: {
      en: { translation: { ... } },
      hi: { translation: { ... } }
    },
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
    }
  });
```

**Using the `useTranslation` Hook:**
```javascript
// In a React component
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  return <h1>{t('Dashboard')}</h1>;
};
```

### 6. Testing Instructions
1.  **Manual Language Switch**: Click the language toggle button in the UI and select "हिंदी (Hindi)". Verify that the dashboard title and other text elements change to Hindi.
2.  **Automatic Detection**: Clear your browser's site data for the application. Set your browser's primary language to German. Reload the application. Verify that the UI automatically loads in German.
3.  **Location-based Suggestion**: On the patient dashboard, if your location is detected as being in India (you may need a VPN or browser spoofer), verify that a toast notification appears suggesting you switch to Hindi.
