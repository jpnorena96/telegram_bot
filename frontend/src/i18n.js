import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationES from './locales/es.json';
import translationEN from './locales/en.json';
import translationPT from './locales/pt.json';

const resources = {
  es: { translation: translationES },
  en: { translation: translationEN },
  pt: { translation: translationPT }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "es", // idioma por defecto
    fallbackLng: "es",
    interpolation: {
      escapeValue: false // react ya protege de xss
    }
  });

export default i18n;
