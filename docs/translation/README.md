# i18next Translation

### 1. Introduction
i18next is a very popular internationalization (i18n) framework for JavaScript. It provides a complete solution to localize products, from web to mobile and desktop. The framework is extensible, and we use it with `react-i18next` for seamless integration with React.

### 2. Integration in MediConnect
Internationalization is a core part of our mission to provide accessible healthcare.

- **Configuration**: The main configuration file is `src/lib/i18n.ts`. It initializes i18next, defines the supported languages (`en`, `hi`, `de`), and configures the `LanguageDetector` plugin.
- **Language Detection**: We use `i18next-browser-languagedetector` to automatically detect the user's preferred language based on `localStorage` and browser settings. This provides a sensible default on their first visit.
- **Provider**: The `I18nProvider` (`src/context/i18n-provider.tsx`) wraps the entire application in `src/app/layout.tsx`, making the i18n instance available to all components.
- **Usage**: In components, we use the `useTranslation` hook from `react-i18next` to access the translation function (`t`) and the current i18n instance.
- **Translation Keys**: Translation strings are stored directly in the `resources` object in `i18n.ts`. For a larger application, these would be moved to separate JSON files per language.

### 3. Benefits
- **React-Friendly**: The `useTranslation` hook integrates cleanly with React's component lifecycle.
- **Automatic Detection**: New users get a localized experience out of the box based on their browser settings.
- **Persistence**: A user's language choice is saved to `localStorage`, so it persists across sessions.
- **Extensible**: Easy to add new languages or integrate with different backends for translation management.

### 4. Flowchart
```mermaid
flowchart TD
  A[App loads] --> B[I18nProvider wraps app]
  B --> C{LanguageDetector runs}
  C -->|Lang in localStorage?| D[Set language from localStorage]
  C -->|No, check browser?| E[Set language from navigator.language]
  C -->|Fallback| F[Set language to 'en']
  D --> G[Component renders]
  E --> G
  F --> G
  G --> H[useTranslation() hook called]
  H --> I{Component uses 't' function}
  I --> J[User sees translated text]
  J --> K{User clicks LanguageToggle}
  K --> L[i18n.changeLanguage() called]
  L --> M[New language saved to localStorage]
  M --> G
```

### 5. Key Code Snippets
**Initializing i18next (`src/lib/i18n.ts`):**
```javascript
i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
    }
  });
```

**Using the `useTranslation` hook:**
```javascript
// In a component like PatientDashboard.tsx
import { useTranslation } from "react-i18next";

const { t } = useTranslation();
// ...
return <h1>{t('Dashboard')}</h1>;
```

**Changing the language:**
```javascript
// In LanguageToggle.tsx
import { useTranslation } from "react-i18next";

const { i18n } = useTranslation();
const changeLanguage = (lang) => {
  i18n.changeLanguage(lang);
};
```

### 6. Testing Instructions
1.  **Default Language**: Clear your browser's `localStorage` for the site. Set your browser's primary language to German. Load the app. Verify that the UI is displayed in German.
2.  **Language Switching**: Use the language toggle button in the UI. Switch from German to Hindi. Verify the UI updates to Hindi.
3.  **Persistence**: With Hindi selected, refresh the page. Verify that the UI remains in Hindi, confirming the preference was loaded from `localStorage`.
4.  **Component Translation**: Navigate to the patient dashboard. Verify that the welcome message and card titles are translated correctly based on the selected language.
