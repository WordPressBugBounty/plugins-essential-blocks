/**
 * WordPress dependencies
 */
import { useEffect, useState } from "@wordpress/element";
import { applyFilters } from "@wordpress/hooks";

/**
 * Resolve an image URL that may be a stored `eb-dynamic-tags/…` string.
 *
 * Pro registers a handler on `essential_blocks_resolve_dynamic_image_url` that
 * fetches the real attachment URL via REST and calls setUrl. If pro isn't
 * active (or the input isn't a dynamic tag), the input is returned as-is.
 */
const getDynamicTagPrefix = () =>
    typeof EssentialBlocksProLocalize !== "undefined" &&
    EssentialBlocksProLocalize?.eb_dynamic_tags
        ? EssentialBlocksProLocalize.eb_dynamic_tags
        : "eb-dynamic-tags";

const isDynamicTagSrc = (src) =>
    typeof src === "string" &&
    src.length > 0 &&
    src.startsWith(getDynamicTagPrefix() + "/");

export default function useResolvedImageUrl(src) {
    // For dynamic tags, start blank so consumers never paint the raw tag
    // string into a CSS url() or <img src> while pro resolves it.
    const [url, setUrl] = useState(() =>
        isDynamicTagSrc(src) ? "" : typeof src === "string" ? src : "",
    );

    useEffect(() => {
        if (typeof src !== "string" || !src) {
            setUrl(src || "");
            return;
        }
        if (!isDynamicTagSrc(src)) {
            setUrl(src);
            return;
        }
        setUrl("");
        applyFilters(
            "essential_blocks_resolve_dynamic_image_url",
            src,
            setUrl,
            src,
        );
    }, [src]);

    return url;
}
