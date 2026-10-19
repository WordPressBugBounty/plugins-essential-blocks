/**
 * Pattern JSON files reference images through these tokens instead of a fixed
 * host, so inserted patterns load images from the site's own plugin folders.
 * Mirrors BlocksPatterns::replace_image_tokens() in PHP (block patterns).
 *
 * @param {string} content Serialized pattern content.
 * @return {string} Content with the tokens replaced.
 */
export const replacePatternImageTokens = (content) => {
    if (typeof content !== "string") {
        return content;
    }

    let result = content;
    const ebImages = window.EssentialBlocksLocalize?.image_url;
    const proImages = window.EssentialBlocksProLocalize?.image_url;

    if (ebImages) {
        result = result.split("{{EB_IMAGES_URL}}").join(ebImages);
    }
    if (proImages) {
        result = result.split("{{EB_PRO_IMAGES_URL}}").join(proImages);
    }

    return result;
};
