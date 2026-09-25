// Runtime machine translation via MyMemory (api.mymemory.translated.net) —
// a free, keyless, publicly available translation API. There's no backend
// proxy for this: it's called straight from the browser, the same way the
// widget on api.mymemory.translated.net's own docs demonstrates. That means
// no secret to protect (there isn't one) and no server cost, at the price
// of the anonymous tier's rate limit (~5000 words/day/IP) — acceptable for
// short UI copy that gets cached hard once translated.

const ENDPOINT = "https://api.mymemory.translated.net/get";
const CACHE_KEY = "frenix_translation_cache_v1";
const CACHE_LIMIT = 4000;

type CacheShape = Record<string, Record<string, string>>;

let memoryCache: CacheShape | null = null;

function loadCache(): CacheShape {
  if (memoryCache) return memoryCache;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    memoryCache = raw ? (JSON.parse(raw) as CacheShape) : {};
  } catch {
    memoryCache = {};
  }
  return memoryCache;
}

function persistCache(cache: CacheShape) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Storage full or unavailable (private browsing) — the in-memory
    // cache for this page load still works, it just won't survive reload.
  }
}

function rememberTranslation(lang: string, source: string, translated: string) {
  const cache = loadCache();
  const bucket = (cache[lang] ??= {});
  bucket[source] = translated;

  // Cheap unbounded-growth guard: once a language's bucket gets large,
  // drop it and start fresh rather than tracking real LRU order for what
  // is, in practice, a bounded set of UI strings per language.
  if (Object.keys(bucket).length > CACHE_LIMIT) {
    cache[lang] = { [source]: translated };
  }
  persistCache(cache);
}

function cachedTranslation(lang: string, source: string): string | undefined {
  return loadCache()[lang]?.[source];
}

// In-flight requests, keyed the same way as the cache, so concurrent calls
// for the same (lang, text) pair — every component rendering the same
// heading at once — share one network request instead of firing N.
const inFlight = new Map<string, Promise<string>>();

function keyFor(lang: string, text: string) {
  return `${lang}\u0000${text}`;
}

/**
 * Translates `text` (assumed English) into `lang`. Resolves to the
 * original text — never rejects — on any failure: unreachable API, rate
 * limit, malformed response, or an untranslatable/empty string. Callers
 * that want to show *something* immediately should render `text` first
 * and swap in the resolved value once this settles, rather than awaiting
 * it inline in a render path.
 */
export async function translateText(text: string, lang: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || lang === "en") return text;

  const cached = cachedTranslation(lang, trimmed);
  if (cached !== undefined) return cached;

  const key = keyFor(lang, trimmed);
  const pending = inFlight.get(key);
  if (pending) return pending;

  const request = (async () => {
    try {
      const url = `${ENDPOINT}?q=${encodeURIComponent(trimmed)}&langpair=en|${encodeURIComponent(lang)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) return text;

      const payload = await res.json();
      const translated: unknown = payload?.responseData?.translatedText;
      // MyMemory returns an all-caps "INVALID …"/"PLEASE SELECT …" message
      // in the same field for a string it couldn't translate — an
      // empty/non-string result or one that looks like an error message
      // isn't worth caching as if it were a real translation.
      if (typeof translated !== "string" || !translated.trim()) return text;
      if (/^(INVALID|PLEASE SELECT)/i.test(translated.trim())) return text;

      rememberTranslation(lang, trimmed, translated);
      return translated;
    } catch {
      return text;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, request);
  return request;
}

/** Synchronous cache read only — used to paint an already-known
 * translation on first render without waiting a tick. */
export function peekTranslation(text: string, lang: string): string | undefined {
  if (lang === "en") return text;
  return cachedTranslation(lang, text.trim());
}
