import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { peekTranslation, translateText } from '../lib/translate';

const STORAGE_KEY = 'frenix_language';

// A broad set of the languages MyMemory (Google/Microsoft/Bing-backed
// underneath) actually translates well — this is the "publicly available"
// language list, not a curated pair we hand-wrote translations for.
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'pl', name: 'Polish', native: 'Polski' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'uk', name: 'Ukrainian', native: 'Українська' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'he', name: 'Hebrew', native: 'עברית' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', native: 'Bahasa Melayu' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', native: 'ไทย' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', native: '简体中文' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', native: '繁體中文' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'sv', name: 'Swedish', native: 'Svenska' },
  { code: 'no', name: 'Norwegian', native: 'Norsk' },
  { code: 'da', name: 'Danish', native: 'Dansk' },
  { code: 'fi', name: 'Finnish', native: 'Suomi' },
  { code: 'el', name: 'Greek', native: 'Ελληνικά' },
  { code: 'cs', name: 'Czech', native: 'Čeština' },
  { code: 'ro', name: 'Romanian', native: 'Română' },
  { code: 'hu', name: 'Hungarian', native: 'Magyar' },
  { code: 'sw', name: 'Swahili', native: 'Kiswahili' },
  { code: 'fa', name: 'Persian', native: 'فارسی' },
];

function readStoredLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED_LANGUAGES.some((l) => l.code === saved) ? saved : 'en';
  } catch {
    return 'en';
  }
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(readStoredLanguage);
  // Bumped whenever a batch of translations resolves, so every `t()` call
  // across the tree re-reads the (module-level) cache in one re-render
  // instead of each pending string forcing its own. Included in the
  // memoized context value's deps below so the value reference actually
  // changes and consumers re-render — otherwise this state lives only on
  // the provider itself and nothing downstream ever notices.
  const [tick, forceRerender] = useState(0);
  const pendingRef = useRef(new Set());
  const flushTimer = useRef(null);

  const setLanguage = useCallback((code) => {
    setLanguageState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // Private browsing / storage disabled — the choice still applies
      // for this page load, it just won't be remembered next time.
    }
  }, []);

  const scheduleFlush = useCallback(() => {
    if (flushTimer.current) return;
    flushTimer.current = setTimeout(() => {
      flushTimer.current = null;
      forceRerender((n) => n + 1);
    }, 60);
  }, []);

  const t = useCallback(
    (text) => {
      if (!text || language === 'en') return text;

      const cached = peekTranslation(text, language);
      if (cached !== undefined) return cached;

      const requestKey = `${language}\u0000${text}`;
      if (!pendingRef.current.has(requestKey)) {
        pendingRef.current.add(requestKey);
        translateText(text, language).finally(() => {
          pendingRef.current.delete(requestKey);
          scheduleFlush();
        });
      }
      return text;
    },
    [language, scheduleFlush],
  );

  useEffect(() => {
    // Switching languages invalidates every in-flight request's usefulness
    // for the *previous* language — nothing to cancel (translateText has
    // no abort hook per-call), but a stale flush landing after a language
    // switch is harmless: it just re-renders with data for a language
    // that's still cached for next time.
    pendingRef.current.clear();
  }, [language]);

  const value = useMemo(
    () => ({ language, setLanguage, languages: SUPPORTED_LANGUAGES, t }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `tick` isn't
    // read, but it must be a dep: bumping it is what turns a resolved
    // translation into a new context value that consumers re-render for.
    [language, setLanguage, t, tick],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside a <LanguageProvider>');
  return ctx;
}

/** Convenience for components that only need the translate function. */
export function useTranslate() {
  return useLanguage().t;
}
