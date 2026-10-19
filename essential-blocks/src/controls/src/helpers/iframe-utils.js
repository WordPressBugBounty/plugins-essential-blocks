/**
 * Centralized iframe editor utilities for Essential Blocks.
 *
 * WordPress 6.3+ renders the block editor inside an <iframe>.
 * These helpers provide a consistent API for accessing the correct
 * document/window context regardless of whether the editor uses
 * an iframe or not.
 */

/**
 * Get the editor iframe element, if it exists.
 *
 * @returns {HTMLIFrameElement|null}
 */
export const getEditorIframe = () => {
    return document.querySelector('iframe[name^="editor-canvas"]');
};

/**
 * Patch Isotope/Outlayer to work with cross-document (iframe) elements.
 *
 * In WP 6.3+ the block editor renders inside an iframe. Outlayer's
 * filterFindElements uses `elem instanceof HTMLElement` to validate
 * elements, but iframe elements are instances of the *iframe's*
 * HTMLElement, not the parent window's. This causes `instanceof` to
 * return false, so Isotope finds 0 items and sets height: 0.
 *
 * Call this once before creating any Isotope instance on iframe elements.
 */
let _isotopePatched = false;
export const patchIsotopeForIframe = () => {
    if (_isotopePatched || !window.Isotope) return;
    _isotopePatched = true;

    const proto = Isotope.prototype;
    proto._filterFindItemElements = function (elems) {
        const arr = Array.from(elems);
        const selector = this.options.itemSelector;
        const result = [];
        arr.forEach((elem) => {
            // Use nodeType check instead of instanceof HTMLElement
            // to support cross-document (iframe) elements
            if (!elem || elem.nodeType !== 1) return;
            if (!selector) {
                result.push(elem);
                return;
            }
            if (elem.matches && elem.matches(selector)) {
                result.push(elem);
            }
            if (elem.querySelectorAll) {
                const children = elem.querySelectorAll(selector);
                for (let i = 0; i < children.length; i++) {
                    result.push(children[i]);
                }
            }
        });
        return result;
    };
};

/**
 * Get the document inside the editor iframe, or fall back to the
 * current (parent) document when no iframe is present.
 *
 * @returns {Document}
 */
export const getEditorDocument = () => {
    const iframe = getEditorIframe();
    if (iframe) {
        return iframe.contentDocument || iframe.contentWindow?.document || document;
    }
    return document;
};

/**
 * Get the window inside the editor iframe, or fall back to the
 * current (parent) window when no iframe is present.
 *
 * @returns {Window}
 */
export const getEditorWindow = () => {
    const iframe = getEditorIframe();
    if (iframe) {
        return iframe.contentWindow || window;
    }
    return window;
};

/**
 * Get the `.editor-styles-wrapper` element from the correct
 * document context (iframe or parent).
 *
 * @returns {Element|null}
 */
export const getEditorRoot = () => {
    const doc = getEditorDocument();
    return doc.querySelector('.editor-styles-wrapper');
};

/**
 * Get the <body> element of the editor document (inside iframe
 * when available, otherwise the parent document body).
 *
 * @returns {HTMLBodyElement}
 */
export const getEditorBody = () => {
    return getEditorDocument().body;
};

/**
 * Get the <html> (documentElement) of the editor document.
 *
 * @returns {HTMLElement}
 */
export const getEditorDocumentElement = () => {
    return getEditorDocument().documentElement;
};

/**
 * Query a selector inside the editor document (iframe-aware).
 *
 * @param {string} selector - CSS selector string
 * @returns {Element|null}
 */
export const editorQuerySelector = (selector) => {
    return getEditorDocument().querySelector(selector);
};

/**
 * Query all matching elements inside the editor document (iframe-aware).
 *
 * @param {string} selector - CSS selector string
 * @returns {NodeList}
 */
export const editorQuerySelectorAll = (selector) => {
    return getEditorDocument().querySelectorAll(selector);
};

/**
 * Run a callback when the editor iframe is ready (loaded and has a body).
 * If no iframe exists, the callback fires immediately with the current document.
 * Returns a cleanup function to disconnect the observer.
 *
 * @param {function(Document): void} callback
 * @returns {function(): void} cleanup
 */
export const onEditorIframeReady = (callback) => {
    const iframe = getEditorIframe();

    // No iframe — fire immediately with current document
    if (!iframe) {
        callback(document);
        return () => { };
    }

    // Iframe already loaded
    if (iframe.contentDocument?.body) {
        callback(iframe.contentDocument);
        return () => { };
    }

    // Wait for iframe to load
    const onLoad = () => {
        if (iframe.contentDocument?.body) {
            callback(iframe.contentDocument);
        }
    };

    iframe.addEventListener('load', onLoad);
    return () => iframe.removeEventListener('load', onLoad);
};

/**
 * Observe for the editor iframe to appear in the DOM (it may not
 * exist on initial render). Calls the callback each time a new
 * iframe is detected. Returns a cleanup function.
 *
 * @param {function(Document): void} callback
 * @returns {function(): void} cleanup
 */
export const observeEditorIframe = (callback) => {
    // Check immediately
    const existingIframe = getEditorIframe();
    if (existingIframe?.contentDocument?.body) {
        callback(existingIframe.contentDocument);
    }

    const observer = new MutationObserver(() => {
        const iframe = getEditorIframe();
        if (iframe?.contentDocument?.body) {
            callback(iframe.contentDocument);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
};

/**
 * Set a CSS custom property on both the parent document and the
 * editor iframe document (if present).
 *
 * @param {string} property - CSS custom property name (e.g. '--eb-foo')
 * @param {string} value    - CSS value
 */
export const setEditorCSSProperty = (property, value) => {
    document.documentElement.style.setProperty(property, value);
    const iframe = getEditorIframe();
    if (iframe?.contentDocument?.documentElement) {
        iframe.contentDocument.documentElement.style.setProperty(property, value);
    }
};

/**
 * Inject a <style> tag into the editor document (iframe-aware).
 * Optionally provide an id to prevent duplicates.
 *
 * @param {string}  cssText - Raw CSS string
 * @param {string} [id]     - Optional id attribute for the style element
 * @returns {HTMLStyleElement}
 */
export const injectEditorStyle = (cssText, id) => {
    const doc = getEditorDocument();

    // Remove existing style with same id to prevent duplicates
    if (id) {
        const existing = doc.getElementById(id);
        if (existing) {
            existing.textContent = cssText;
            return existing;
        }
    }

    const style = doc.createElement('style');
    style.type = 'text/css';
    if (id) {
        style.id = id;
    }
    style.textContent = cssText;
    doc.head.appendChild(style);
    return style;
};

/**
 * Inject a <link> stylesheet into the editor document (iframe-aware).
 * Uses an id to prevent duplicate injections.
 *
 * @param {string} href - URL of the stylesheet
 * @param {string} id   - Unique id for the link element
 * @returns {HTMLLinkElement}
 */
export const injectEditorStylesheet = (href, id) => {
    const doc = getEditorDocument();

    // Prevent duplicates
    if (id && doc.getElementById(id)) {
        return doc.getElementById(id);
    }

    const link = doc.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    if (id) {
        link.id = id;
    }
    doc.head.appendChild(link);
    return link;
};
