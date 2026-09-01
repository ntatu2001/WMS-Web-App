import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import { vi } from 'date-fns/locale/vi';
import { enUS } from 'date-fns/locale/en-US';

registerLocale('vi', vi);
registerLocale('en', enUS);

/**
 * Applies the current language to <html lang> and to react-datepicker's default
 * locale. Call once, near the app root (next to useApplyTheme).
 */
export default function useApplyLanguage() {
  const lang = useSelector((state) => state.language.lang);

  useEffect(() => {
    document.documentElement.lang = lang;
    setDefaultLocale(lang);
  }, [lang]);
}
