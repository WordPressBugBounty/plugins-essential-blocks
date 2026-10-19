/**
 * "Unlock the PRO features" dialog shown for locked Pro items.
 */
import { __ } from "@wordpress/i18n";

import Modal from "./ui/Modal";
import Button from "./ui/Button";

const FALLBACK_UPGRADE_URL = "https://essential-blocks.com/upgrade-to-pro-quick-setup";

/**
 * @param {Object}   props
 * @param {Function} props.onClose
 * @return {JSX.Element} Upgrade dialog.
 */
export default function ProUpgradeModal({ onClose }) {
    const upgradeUrl = EssentialBlocksLocalize?.upgrade_pro_url || FALLBACK_UPGRADE_URL;

    return (
        <Modal
            title={__("Unlock the PRO Features", "essential-blocks")}
            onClose={onClose}
            size="sm"
            className="eb-pro-upgrade-modal"
        >
            <div className="eb-pro-upgrade-modal__icon" aria-hidden="true">
                <svg
                    width="56"
                    height="56"
                    viewBox="0 0 56 56"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M44.3339 22.3531L38.3372 23.8465L30.8472 14.5131C30.5193 14.1044 30.1037 13.7745 29.6312 13.5478C29.1587 13.3211 28.6413 13.2034 28.1172 13.2034C27.5931 13.2034 27.0757 13.3211 26.6032 13.5478C26.1307 13.7745 25.7152 14.1044 25.3872 14.5131L17.8972 23.8465L11.7839 22.3531C11.198 22.2129 10.5859 22.2253 10.0062 22.389C9.42645 22.5527 8.89837 22.8623 8.47239 23.2883C8.04641 23.7143 7.73677 24.2424 7.57305 24.8221C7.40932 25.4019 7.39698 26.0139 7.53721 26.5998L11.6672 41.1131C11.8083 41.6178 12.1153 42.0603 12.5386 42.3693C12.9618 42.6783 13.4768 42.8358 14.0005 42.8165H42.0005C42.5243 42.8358 43.0392 42.6783 43.4625 42.3693C43.8858 42.0603 44.1927 41.6178 44.3339 41.1131L48.4872 26.5998C48.6213 26.0232 48.6079 25.4222 48.4484 24.8521C48.2888 24.2821 47.9882 23.7615 47.5743 23.3383C47.1604 22.9151 46.6466 22.603 46.0802 22.4308C45.5139 22.2586 44.9133 22.2319 44.3339 22.3531Z"
                        fill="#EFA83C"
                    />
                    <path
                        d="M6.41667 19.8333C8.0275 19.8333 9.33333 18.5275 9.33333 16.9167C9.33333 15.3058 8.0275 14 6.41667 14C4.80584 14 3.5 15.3058 3.5 16.9167C3.5 18.5275 4.80584 19.8333 6.41667 19.8333Z"
                        fill="#EFA83C"
                    />
                    <path
                        d="M49.5827 19.8333C51.1935 19.8333 52.4993 18.5275 52.4993 16.9167C52.4993 15.3058 51.1935 14 49.5827 14C47.9719 14 46.666 15.3058 46.666 16.9167C46.666 18.5275 47.9719 19.8333 49.5827 19.8333Z"
                        fill="#EFA83C"
                    />
                    <path
                        d="M28.0007 9.91659C29.6115 9.91659 30.9173 8.61075 30.9173 6.99992C30.9173 5.38909 29.6115 4.08325 28.0007 4.08325C26.3898 4.08325 25.084 5.38909 25.084 6.99992C25.084 8.61075 26.3898 9.91659 28.0007 9.91659Z"
                        fill="#EFA83C"
                    />
                    <path
                        d="M41.9994 51.3332H13.9993C13.3805 51.3332 12.787 51.0873 12.3494 50.6498C11.9118 50.2122 11.666 49.6187 11.666 48.9998C11.666 48.381 11.9118 47.7875 12.3494 47.3499C12.787 46.9123 13.3805 46.6665 13.9993 46.6665H41.9994C42.6182 46.6665 43.2117 46.9123 43.6493 47.3499C44.0869 47.7875 44.3327 48.381 44.3327 48.9998C44.3327 49.6187 44.0869 50.2122 43.6493 50.6498C43.2117 51.0873 42.6182 51.3332 41.9994 51.3332Z"
                        fill="#EFA83C"
                    />
                </svg>
            </div>
            <p>
                {__(
                    "Upgrade to Essential Blocks PRO and gain access to advanced blocks and features to build websites more efficiently.",
                    "essential-blocks",
                )}
            </p>
            <Button href={upgradeUrl} target="_blank" rel="noopener noreferrer">
                {__("Upgrade to PRO", "essential-blocks")}
            </Button>
        </Modal>
    );
}
