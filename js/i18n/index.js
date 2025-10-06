(function (global) {
    const STORAGE_KEY = 'yu-roguelike:language';
    const DEFAULT_LOCALE = 'ja';
    const FALLBACK_LOCALE = 'ja';
    const SUPPORTED_LOCALES = Object.freeze(['ja', 'en']);
    const LOCALE_PATH = './js/i18n/locales';

    const dictionaryCache = new Map();
    const loadingCache = new Map();
    const listeners = new Set();

    let activeLocale = DEFAULT_LOCALE;
    let activeDictionary = {};
    let fallbackDictionary = {};
    let ready = false;

    function resolveLocale(locale) {
        if (typeof locale === 'string' && locale.trim()) {
            const normalized = locale.trim().toLowerCase();
            const matched = SUPPORTED_LOCALES.find((candidate) => candidate.toLowerCase() === normalized);
            if (matched) return matched;
        }
        return DEFAULT_LOCALE;
    }

    function getStoredLocale() {
        try {
            const value = global.localStorage?.getItem(STORAGE_KEY);
            return value ? resolveLocale(value) : null;
        } catch (error) {
            console.warn('[i18n] Failed to read language from storage:', error);
            return null;
        }
    }

    function persistLocale(locale) {
        try {
            global.localStorage?.setItem(STORAGE_KEY, locale);
        } catch (error) {
            console.warn('[i18n] Failed to persist language:', error);
        }
    }

    function updateDocumentLanguage(locale) {
        if (typeof document === 'undefined') return;
        const lang = locale || DEFAULT_LOCALE;
        if (document.documentElement?.lang !== lang) {
            document.documentElement.lang = lang;
        }
    }

    function applyParams(template, params) {
        if (!params || typeof template !== 'string') return template;
        return template.replace(/\{([^{}]+)\}/g, (match, token) => {
            const key = token.trim();
            if (!key) return match;
            const value = params[key];
            return value === undefined || value === null ? match : String(value);
        });
    }

    function dig(dictionary, key) {
        if (!dictionary) return undefined;
        if (Object.prototype.hasOwnProperty.call(dictionary, key)) {
            return dictionary[key];
        }
        const segments = key.split('.');
        let current = dictionary;
        for (let i = 0; i < segments.length; i += 1) {
            const segment = segments[i];
            if (segment && typeof current === 'object' && segment in current) {
                current = current[segment];
            } else {
                return undefined;
            }
        }
        return current;
    }

    function getDictionaryValue(key) {
        const primary = dig(activeDictionary, key);
        if (primary !== undefined) return primary;
        const fallback = dig(fallbackDictionary, key);
        if (fallback !== undefined) return fallback;
        return undefined;
    }

    async function fetchDictionary(locale) {
        if (dictionaryCache.has(locale)) {
            return dictionaryCache.get(locale);
        }
        if (loadingCache.has(locale)) {
            return loadingCache.get(locale);
        }
        const promise = (async () => {
            const url = `${LOCALE_PATH}/${locale}.json`;
            let payload = {};
            try {
                const response = await fetch(url, { cache: 'no-store' });
                if (response.ok) {
                    const data = await response.json();
                    if (data && typeof data === 'object') {
                        payload = data;
                    }
                } else if (response.status !== 404) {
                    console.warn(`[i18n] Failed to load locale "${locale}": ${response.status}`);
                }
            } catch (error) {
                console.warn(`[i18n] Error loading locale "${locale}":`, error);
            }
            dictionaryCache.set(locale, payload || {});
            return dictionaryCache.get(locale);
        })();
        loadingCache.set(locale, promise);
        try {
            return await promise;
        } finally {
            loadingCache.delete(locale);
        }
    }

    function notifyLocaleChanged(locale) {
        listeners.forEach((listener) => {
            try {
                listener(locale);
            } catch (error) {
                console.error('[i18n] Locale listener error:', error);
            }
        });
        if (typeof document !== 'undefined') {
            const event = new CustomEvent('i18n:locale-changed', { detail: { locale } });
            document.dispatchEvent(event);
        }
    }

    async function setLocale(locale) {
        const resolved = resolveLocale(locale);
        if (resolved === activeLocale && ready) {
            persistLocale(resolved);
            updateDocumentLanguage(resolved);
            return resolved;
        }
        const dictionary = await fetchDictionary(resolved);
        const fallback = resolved === FALLBACK_LOCALE
            ? dictionary
            : await fetchDictionary(FALLBACK_LOCALE);
        activeLocale = resolved;
        activeDictionary = dictionary || {};
        fallbackDictionary = fallback || {};
        ready = true;
        persistLocale(resolved);
        updateDocumentLanguage(resolved);
        notifyLocaleChanged(resolved);
        return resolved;
    }

    function t(key, params) {
        if (!key) return '';
        const value = getDictionaryValue(key);
        if (typeof value === 'string') {
            return applyParams(value, params);
        }
        if (value !== undefined) {
            return value;
        }
        return typeof key === 'string' ? key : String(key);
    }

    function formatNumber(value, options) {
        const locale = activeLocale || DEFAULT_LOCALE;
        try {
            return new Intl.NumberFormat(locale, options).format(value);
        } catch (error) {
            return new Intl.NumberFormat(FALLBACK_LOCALE, options).format(value);
        }
    }

    function formatDate(value, options) {
        const date = value instanceof Date ? value : new Date(value);
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
        const locale = activeLocale || DEFAULT_LOCALE;
        try {
            return new Intl.DateTimeFormat(locale, options).format(date);
        } catch (error) {
            return new Intl.DateTimeFormat(FALLBACK_LOCALE, options).format(date);
        }
    }

    function formatRelativeTime(value, unit, options) {
        const locale = activeLocale || DEFAULT_LOCALE;
        try {
            return new Intl.RelativeTimeFormat(locale, options).format(value, unit);
        } catch (error) {
            return new Intl.RelativeTimeFormat(FALLBACK_LOCALE, options).format(value, unit);
        }
    }

    function onLocaleChanged(listener) {
        if (typeof listener !== 'function') return () => {};
        listeners.add(listener);
        return () => listeners.delete(listener);
    }

    async function init(initialLocale) {
        const stored = getStoredLocale();
        const target = resolveLocale(initialLocale || stored || activeLocale || DEFAULT_LOCALE);
        return setLocale(target);
    }

    function isReady() {
        return ready;
    }

    function getLocale() {
        return activeLocale;
    }

    function getDefaultLocale() {
        return DEFAULT_LOCALE;
    }

    function getSupportedLocales() {
        return Array.from(SUPPORTED_LOCALES);
    }

    if (typeof global.addEventListener === 'function') {
        global.addEventListener('storage', (event) => {
            if (event.key === STORAGE_KEY && event.newValue) {
                const nextLocale = resolveLocale(event.newValue);
                if (nextLocale !== activeLocale) {
                    setLocale(nextLocale);
                }
            }
        });
    }

    const api = {
        init,
        setLocale,
        t,
        formatNumber,
        formatDate,
        formatRelativeTime,
        getLocale,
        getDefaultLocale,
        getSupportedLocales,
        getStoredLocale,
        getStorageKey: () => STORAGE_KEY,
        isReady,
        onLocaleChanged,
        resolveLocale,
        loadLocale: fetchDictionary,
    };

    global.I18n = api;
})(typeof window !== 'undefined' ? window : globalThis);
