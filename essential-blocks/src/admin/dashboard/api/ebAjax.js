/**
 * Admin-ajax transport for the Essential Blocks dashboard.
 *
 * Every request resolves (never rejects) to one normalized shape so the UI
 * can tell a real success from a nonce failure, a network failure, an
 * unreadable body or a server-reported failure.
 *
 * Keep this file free of imports: it is loaded directly by Node in
 * tests/admin-ui/ebajax.fixtures.mjs.
 */

/* global globalThis */

/** Result codes. `null` when ok. */
export const EB_AJAX_CODE = {
    NONCE: "nonce",
    NETWORK: "network",
    INVALID: "invalid_response",
    SERVER: "server",
};

const FALLBACK_ERROR = "Unexpected response from the server.";

// Localized "nonce failure" strings registered by the UI (exact match).
const extraNonceMessages = new Set();
const sessionListeners = new Set();

/**
 * Listen for requests that failed because the session nonce expired.
 *
 * @param {Function} listener Called with the EbAjaxResult.
 * @return {Function} Unsubscribe.
 */
export function onSessionExpired(listener) {
    sessionListeners.add(listener);
    return () => sessionListeners.delete(listener);
}

/**
 * Register extra exact strings that mean "nonce failure" (e.g. the
 * localized "Nonce Error" / "Nonce did not match").
 *
 * @param {string[]} list Strings.
 */
export function registerNonceMessages(list) {
    (list || []).forEach((text) => {
        if (typeof text === "string" && text.trim()) {
            extraNonceMessages.add(text.trim());
        }
    });
}

/**
 * @typedef {Object} EbAjaxResult
 * @property {boolean}     ok     True only when the request truly succeeded.
 * @property {*}           data   Envelope `data` (when there is an envelope), else the parsed JSON, else null.
 * @property {string|null} error  Human-readable message (server text when available), null when ok.
 * @property {string|null} code   One of EB_AJAX_CODE, null when ok.
 * @property {string|null} raw    Response text exactly as received (null on network error).
 * @property {number}      status HTTP status (0 on network error).
 */

/**
 * Message from any server payload shape: string, string[], {message},
 * {messsage} (sic, used by eb_regenerate_assets), {error_message},
 * {detail}, {error} or WP_Error-like {errors:{code:[msg]}}.
 * Returns '' when no message is found.
 *
 * @param {*} payload
 * @return {string} The message, or an empty string.
 */
export function messageOf(payload) {
    if (typeof payload === "string") {
        return payload;
    }
    if (Array.isArray(payload)) {
        return payload
            .map((item) => messageOf(item))
            .filter(Boolean)
            .join(" ");
    }
    if (payload && typeof payload === "object") {
        if (payload.message !== undefined) {
            return messageOf(payload.message);
        }
        if (payload.messsage !== undefined) {
            return messageOf(payload.messsage);
        }
        // Google proxy (`error_message`) and Openverse (`detail`, `error`).
        for (const key of ["error_message", "detail", "error"]) {
            if (typeof payload[key] === "string" && payload[key]) {
                return payload[key];
            }
        }
        if (payload.errors && typeof payload.errors === "object") {
            for (const key of Object.keys(payload.errors)) {
                const list = payload.errors[key];
                const first = Array.isArray(list) ? list[0] : list;
                if (typeof first === "string" && first) {
                    return first;
                }
            }
        }
    }
    return "";
}

/**
 * True when a response text says the session nonce is no longer valid.
 * Best effort: matches the English "Nonce Error" / "Nonce did not match".
 *
 * @param {string} text
 * @return {boolean} Whether the text reports a nonce failure.
 */
export function isNonceFailure(text) {
    return (
        typeof text === "string" &&
        (/nonce/i.test(text) || extraNonceMessages.has(text.trim()))
    );
}

const result = (fields) => ({
    ok: false,
    data: null,
    error: null,
    code: null,
    raw: null,
    status: 0,
    ...fields,
});

/**
 * Pure: turn an HTTP status + body text into an EbAjaxResult.
 *
 * @param {{status:number, text:string}} response  HTTP status and body text.
 * @param {{isOk?:(json:any)=>boolean}}  [options] Success rule for actions that reply without a WP envelope.
 * @return {EbAjaxResult} Normalized result.
 */
export function normalizeResponse({ status, text }, { isOk } = {}) {
    const raw = typeof text === "string" ? text : "";
    const body = raw.replace(/^\uFEFF/, "").trim();

    let json;
    let parsed = false;
    if (body !== "") {
        try {
            json = JSON.parse(body);
            parsed = true;
        } catch (e) {
            parsed = false;
        }
    }

    // Bodies such as '', '0', '-1' parse (or not) into values that are not
    // a usable payload. Treat everything that is not an object/array/null
    // JSON value as "no JSON".
    const usable = parsed && (json === null || typeof json === "object");

    if (!usable) {
        // Logged out: admin-ajax answers 0 with HTTP 400 (no nopriv hook).
        const nonce =
            isNonceFailure(body) ||
            (status === 403 && (body === "-1" || body === "0")) ||
            (status === 400 && body === "0");
        return result({
            code: nonce ? EB_AJAX_CODE.NONCE : EB_AJAX_CODE.INVALID,
            error: nonce ? body : FALLBACK_ERROR,
            raw,
            status,
        });
    }

    if (json === null) {
        return result({
            code: EB_AJAX_CODE.INVALID,
            error: FALLBACK_ERROR,
            raw,
            status,
        });
    }

    if (!Array.isArray(json) && typeof json.success === "boolean") {
        if (json.success === false) {
            const error = messageOf(json.data) || FALLBACK_ERROR;
            return result({
                data: json.data,
                code: isNonceFailure(error)
                    ? EB_AJAX_CODE.NONCE
                    : EB_AJAX_CODE.SERVER,
                error,
                raw,
                status,
            });
        }

        const ok = isOk
            ? !!isOk(json)
            : !(
                  json.data &&
                  typeof json.data === "object" &&
                  json.data.success === false
              );

        return result({
            ok,
            data: json.data,
            code: ok ? null : EB_AJAX_CODE.SERVER,
            error: ok ? null : messageOf(json.data) || FALLBACK_ERROR,
            raw,
            status,
        });
    }

    const ok = isOk ? !!isOk(json) : status >= 200 && status < 300;
    return result({
        ok,
        data: json,
        code: ok ? null : EB_AJAX_CODE.SERVER,
        error: ok ? null : messageOf(json) || FALLBACK_ERROR,
        raw,
        status,
    });
}

/**
 * POST to admin-ajax with FormData. Always resolves, never rejects.
 *
 * Field order: `action` first, then `fields` in the given order. When
 * `fields` has no `admin_nonce` pair, `admin_nonce` is appended last.
 *
 * @param {string}                                 action    admin-ajax action name.
 * @param {Array<[string, string|number|boolean]>} [fields]  Ordered field pairs.
 * @param {{isOk?:Function, signal?:AbortSignal}}  [options] Success rule and abort signal.
 * @return {Promise<EbAjaxResult>} Always resolves.
 */
export function ebAjax(action, fields = [], options = {}) {
    const localize =
        (typeof window !== "undefined" && window.EssentialBlocksLocalize) ||
        globalThis.EssentialBlocksLocalize ||
        {};

    const formData = new FormData();
    formData.append("action", action);

    let hasNonce = false;
    (fields || []).forEach(([name, value]) => {
        if (name === "admin_nonce") {
            hasNonce = true;
        }
        formData.append(name, value);
    });
    if (!hasNonce) {
        formData.append("admin_nonce", localize.admin_nonce);
    }

    const request = {
        method: "POST",
        body: formData,
    };
    if (options.signal) {
        request.signal = options.signal;
    }

    let status = 0;
    return fetch(localize.ajax_url, request)
        .then((response) => {
            status = response.status;
            return response.text();
        })
        .then((text) => {
            const res = normalizeResponse(
                { status, text },
                { isOk: options.isOk }
            );
            if (res.code === EB_AJAX_CODE.NONCE) {
                sessionListeners.forEach((listener) => {
                    try {
                        listener(res);
                    } catch (e) {
                        // A listener must never break the request flow.
                    }
                });
            }
            return res;
        })
        .catch((err) =>
            result({
                code: EB_AJAX_CODE.NETWORK,
                error: (err && err.message) || "Network error",
                status: 0,
            })
        );
}
