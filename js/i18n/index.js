(function (global) {
    const STORAGE_KEY = 'yu-roguelike:language';
    const DEFAULT_LOCALE = 'ja';
    const FALLBACK_LOCALE = 'ja';
    const SUPPORTED_LOCALES = Object.freeze(['ja', 'en', 'zh']);
    const LOCALE_FALLBACKS = Object.freeze({ zh: 'en' });
    const LOCALE_PATH = 'js/i18n/locales';
    const LOCALE_EXTENSION = '.json.js';

    const localeBaseUrl = (() => {
        if (typeof document === 'undefined') return null;
        try {
            const scripts = document.getElementsByTagName('script');
            for (let i = scripts.length - 1; i >= 0; i -= 1) {
                const script = scripts[i];
                const srcAttr = script?.getAttribute?.('src');
                if (!srcAttr) continue;
                const resolved = new URL(srcAttr, document.baseURI);
                if (resolved.pathname.endsWith('/js/i18n/index.js') || resolved.pathname.endsWith('js/i18n/index.js')) {
                    const directory = new URL('./', resolved);
                    return new URL('locales/', directory);
                }
            }
            const sanitizedPath = LOCALE_PATH.replace(/^\.\//, '').replace(/\/+$/, '');
            return new URL(`${sanitizedPath}/`, document.baseURI);
        } catch (error) {
            console.warn('[i18n] Failed to resolve locale base URL:', error);
            return null;
        }
    })();

    const dictionaryCache = new Map();
    const loadingCache = new Map();
    const listeners = new Set();
    const TEXT_NODE = typeof Node !== 'undefined' ? Node.TEXT_NODE : 3;
    const ELEMENT_CTOR = typeof Element !== 'undefined' ? Element : null;
    const DOCUMENT_CTOR = typeof Document !== 'undefined' ? Document : null;
    const DOCUMENT_FRAGMENT_CTOR = typeof DocumentFragment !== 'undefined' ? DocumentFragment : null;

    let activeLocale = DEFAULT_LOCALE;
    let activeDictionary = {};
    let fallbackDictionary = {};
    let activeFallbackLocale = FALLBACK_LOCALE;
    let ready = false;

    function resolveLocale(locale) {
        if (typeof locale === 'string' && locale.trim()) {
            const normalized = locale.trim().toLowerCase();
            const matched = SUPPORTED_LOCALES.find((candidate) => candidate.toLowerCase() === normalized);
            if (matched) return matched;
        }
        return DEFAULT_LOCALE;
    }

    function getFallbackLocaleFor(locale) {
        if (!locale) return FALLBACK_LOCALE;
        const fallback = LOCALE_FALLBACKS[locale];
        if (typeof fallback === 'string' && fallback && SUPPORTED_LOCALES.includes(fallback) && fallback !== locale) {
            return fallback;
        }
        return FALLBACK_LOCALE;
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

    function getGlobalLocaleStore() {
        const root = typeof globalThis !== 'undefined'
            ? globalThis
            : typeof global !== 'undefined'
                ? global
                : typeof window !== 'undefined'
                    ? window
                    : typeof self !== 'undefined'
                        ? self
                        : null;
        if (!root) return null;
        if (!root.__i18nLocales) {
            Object.defineProperty(root, '__i18nLocales', {
                value: {},
                enumerable: false,
                configurable: true,
                writable: true,
            });
        }
        return root.__i18nLocales;
    }

    function getDictionaryFromGlobal(locale) {
        const store = getGlobalLocaleStore();
        if (store && store[locale] && typeof store[locale] === 'object') {
            return store[locale];
        }
        return null;
    }

    async function fetchDictionary(locale) {
        if (dictionaryCache.has(locale)) {
            return dictionaryCache.get(locale);
        }
        if (loadingCache.has(locale)) {
            return loadingCache.get(locale);
        }
        const promise = (async () => {
            const existing = getDictionaryFromGlobal(locale);
            if (existing) {
                dictionaryCache.set(locale, existing);
                return existing;
            }

            if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
                if (typeof require === 'function') {
                    try {
                        require(`./locales/${locale}${LOCALE_EXTENSION}`);
                        const dictionary = getDictionaryFromGlobal(locale) || {};
                        dictionaryCache.set(locale, dictionary);
                        return dictionary;
                    } catch (error) {
                        console.warn(`[i18n] Error loading locale "${locale}" via require:`, error);
                    }
                }
                dictionaryCache.set(locale, {});
                return {};
            }

            const target = document.head || document.getElementsByTagName?.('head')?.[0] || document.body || document.documentElement;
            if (!target) {
                dictionaryCache.set(locale, {});
                return {};
            }

            await new Promise((resolve) => {
                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.async = true;
                script.onload = () => resolve(true);
                script.onerror = (error) => {
                    console.warn(`[i18n] Failed to load locale "${locale}" script:`, error);
                    resolve(false);
                };
                if (localeBaseUrl) {
                    try {
                        script.src = new URL(`${locale}${LOCALE_EXTENSION}`, localeBaseUrl).href;
                    } catch (error) {
                        console.warn('[i18n] Failed to build locale URL from base:', error);
                        script.src = `${LOCALE_PATH}/${locale}${LOCALE_EXTENSION}`;
                    }
                } else {
                    script.src = `${LOCALE_PATH}/${locale}${LOCALE_EXTENSION}`;
                }
                target.appendChild(script);
            });

            const dictionary = getDictionaryFromGlobal(locale) || {};
            dictionaryCache.set(locale, dictionary);
            return dictionary;
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
        const fallbackLocale = getFallbackLocaleFor(resolved);
        const fallback = resolved === fallbackLocale
            ? dictionary
            : await fetchDictionary(fallbackLocale);
        activeLocale = resolved;
        activeDictionary = dictionary || {};
        fallbackDictionary = fallback || {};
        activeFallbackLocale = fallbackLocale;
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

    function exists(key) {
        if (!key) return false;
        return getDictionaryValue(key) !== undefined;
    }

    function formatNumber(value, options) {
        const locale = activeLocale || DEFAULT_LOCALE;
        try {
            return new Intl.NumberFormat(locale, options).format(value);
        } catch (error) {
            const fallbackLocale = activeFallbackLocale || FALLBACK_LOCALE;
            return new Intl.NumberFormat(fallbackLocale, options).format(value);
        }
    }

    function formatDate(value, options) {
        const date = value instanceof Date ? value : new Date(value);
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
        const locale = activeLocale || DEFAULT_LOCALE;
        try {
            return new Intl.DateTimeFormat(locale, options).format(date);
        } catch (error) {
            const fallbackLocale = activeFallbackLocale || FALLBACK_LOCALE;
            return new Intl.DateTimeFormat(fallbackLocale, options).format(date);
        }
    }

    function formatRelativeTime(value, unit, options) {
        const locale = activeLocale || DEFAULT_LOCALE;
        try {
            return new Intl.RelativeTimeFormat(locale, options).format(value, unit);
        } catch (error) {
            const fallbackLocale = activeFallbackLocale || FALLBACK_LOCALE;
            return new Intl.RelativeTimeFormat(fallbackLocale, options).format(value, unit);
        }
    }

    function localeCompare(a, b, options) {
        const primary = activeLocale || DEFAULT_LOCALE;
        const left = a ?? '';
        const right = b ?? '';
        try {
            if (typeof left.localeCompare === 'function') {
                return left.localeCompare(right, primary, options);
            }
        } catch (error) {
            // Ignore and fall back below.
        }
        try {
            return String(left).localeCompare(String(right), activeFallbackLocale || FALLBACK_LOCALE, options);
        } catch (error) {
            return 0;
        }
    }

    function resolveTranslationRoot(root) {
        if (!root || root === document) {
            return document;
        }
        const isElement = ELEMENT_CTOR && root instanceof ELEMENT_CTOR;
        const isDocument = DOCUMENT_CTOR && root instanceof DOCUMENT_CTOR;
        const isFragment = DOCUMENT_FRAGMENT_CTOR && root instanceof DOCUMENT_FRAGMENT_CTOR;
        if (isElement || isDocument || isFragment) {
            return root;
        }
        return document;
    }

    function ensureTextNode(element) {
        if (!element || typeof element.insertBefore !== 'function') return null;
        for (let i = 0; i < element.childNodes.length; i += 1) {
            const node = element.childNodes[i];
            if (node?.nodeType === TEXT_NODE) {
                return node;
            }
        }
        const textNode = document.createTextNode('');
        element.insertBefore(textNode, element.firstChild || null);
        return textNode;
    }

    function applyElementTranslation(element) {
        if (!ELEMENT_CTOR || !(element instanceof ELEMENT_CTOR)) return;
        const key = element.getAttribute('data-i18n');
        const attrSpec = element.getAttribute('data-i18n-attr');
        if (key) {
            const value = t(key);
            if (value !== undefined && value !== null) {
                if (element.hasAttribute('data-i18n-html')) {
                    element.innerHTML = value;
                } else if (element.childElementCount === 0) {
                    element.textContent = value;
                } else {
                    const textNode = ensureTextNode(element);
                    if (textNode) {
                        textNode.textContent = value;
                    }
                }
            }
        }
        if (attrSpec) {
            const segments = attrSpec.split(/[;,]/);
            segments.forEach((segment) => {
                const pair = segment.split(':');
                if (pair.length < 2) return;
                const attrName = pair[0].trim();
                const attrKey = pair.slice(1).join(':').trim();
                if (!attrName || !attrKey) return;
                const attrValue = t(attrKey);
                if (attrValue !== undefined && attrValue !== null) {
                    element.setAttribute(attrName, attrValue);
                }
            });
        }
    }

    function applyTranslations(root) {
        if (typeof document === 'undefined') return;
        const scope = resolveTranslationRoot(root);
        const elements = [];
        const scopeIsElement = ELEMENT_CTOR && scope instanceof ELEMENT_CTOR;
        const scopeIsFragment = DOCUMENT_FRAGMENT_CTOR && scope instanceof DOCUMENT_FRAGMENT_CTOR;
        const scopeIsDocument = DOCUMENT_CTOR && scope instanceof DOCUMENT_CTOR;
        if (scopeIsElement || scopeIsFragment) {
            if (scope.hasAttribute?.('data-i18n') || scope.hasAttribute?.('data-i18n-attr')) {
                elements.push(scope);
            }
        } else if (scopeIsDocument && scope.documentElement) {
            const el = scope.documentElement;
            if (el.hasAttribute('data-i18n') || el.hasAttribute('data-i18n-attr')) {
                elements.push(el);
            }
        }
        if (typeof scope.querySelectorAll === 'function') {
            scope.querySelectorAll('[data-i18n],[data-i18n-attr]').forEach((element) => {
                elements.push(element);
            });
        }
        const processed = new Set();
        elements.forEach((element) => {
            if (processed.has(element)) return;
            processed.add(element);
            applyElementTranslation(element);
        });
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
        localeCompare,
        getLocale,
        getDefaultLocale,
        getSupportedLocales,
        getFallbackLocale: (locale) => getFallbackLocaleFor(locale || activeLocale),
        getStoredLocale,
        getStorageKey: () => STORAGE_KEY,
        isReady,
        onLocaleChanged,
        resolveLocale,
        loadLocale: fetchDictionary,
        applyTranslations,
        exists,
    };

    global.I18n = api;
})(typeof window !== 'undefined' ? window : globalThis);
