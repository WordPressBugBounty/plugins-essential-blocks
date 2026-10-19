/**
 * SVG upload security gate for the custom SVG mask (Mask Type "SVG" →
 * Custom shape). Pro's Morphing custom SVG pool has its own copy, and the
 * icon-picker keeps an inline one; all three follow the same rules.
 *
 * `EssentialBlocksLocalize.unfilteredFile` and `…is_admin_user` are PHP-side
 * string booleans (`"true"` / `"false"`); compared against the literal to
 * stay consistent with the rest of the codebase.
 */
import { __ } from "@wordpress/i18n";
import { EB_LINKS } from "../../helpers/ebLinks";
import { Button, Modal } from "@wordpress/components";

export const isSvgUploadAllowed = () => {
    const localize =
        typeof window !== "undefined" ? window.EssentialBlocksLocalize : null;
    const enabled = localize?.unfilteredFile === "true";
    const isAdmin = localize?.is_admin_user === "true";
    return enabled && isAdmin;
};

export const SvgUploadWarningModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const localize =
        typeof window !== "undefined" ? window.EssentialBlocksLocalize : null;
    const isAdminUser = localize?.is_admin_user === "true";

    return (
        <Modal
            title={
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                    }}
                >
                    {isAdminUser
                        ? __("SVG Upload Disabled", "essential-blocks")
                        : __("Upload Restricted", "essential-blocks")}
                </div>
            }
            onRequestClose={onClose}
            className="eb-svg-warning-modal"
            style={{ maxWidth: "500px" }}
        >
            <div style={{ padding: "20px 0" }}>
                {isAdminUser ? (
                    <>
                        <p style={{ marginBottom: "15px", lineHeight: "1.6" }}>
                            {__(
                                "SVG file uploads are currently disabled for security reasons. To enable SVG uploads, please go to Essential Blocks Settings > Options and enable 'Unfiltered File Uploads'.",
                                "essential-blocks"
                            )}
                        </p>
                        <p
                            style={{
                                marginBottom: "20px",
                                lineHeight: "1.6",
                                color: "#d63638",
                                fontWeight: "500",
                            }}
                        >
                            {__(
                                "Warning: This feature should only be enabled if you understand the security risks involved.",
                                "essential-blocks"
                            )}
                        </p>
                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                justifyContent: "flex-end",
                            }}
                        >
                            <Button
                                variant="tertiary"
                                onClick={() => {
                                    window.open(EB_LINKS.docs.unfilteredUploads, "_blank");
                                }}
                            >
                                {__("Learn More", "essential-blocks")}
                            </Button>
                            <Button
                                variant="primary"
                                onClick={onClose}
                                style={{
                                    backgroundColor: "#cebeff",
                                    color: "#551ef7",
                                    borderColor: "#cebeff",
                                }}
                            >
                                {__("Got it", "essential-blocks")}
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <p style={{ marginBottom: "15px", lineHeight: "1.6" }}>
                            {__(
                                "Sorry, you can't upload that file yet.",
                                "essential-blocks"
                            )}
                        </p>
                        <p style={{ marginBottom: "15px", lineHeight: "1.6" }}>
                            {__(
                                "This is because SVG files may pose a security risk.",
                                "essential-blocks"
                            )}
                        </p>
                        <p
                            style={{
                                marginBottom: "20px",
                                lineHeight: "1.6",
                                fontWeight: "500",
                            }}
                        >
                            {__(
                                "Contact with administrator",
                                "essential-blocks"
                            )}
                        </p>
                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                justifyContent: "flex-end",
                            }}
                        >
                            <Button
                                variant="primary"
                                onClick={onClose}
                                style={{
                                    backgroundColor: "#cebeff",
                                    color: "#551ef7",
                                    borderColor: "#cebeff",
                                }}
                            >
                                {__("Got it", "essential-blocks")}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default SvgUploadWarningModal;
