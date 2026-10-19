/**
 * One extension on the Extensions tab.
 */
/**
 * WordPress dependencies
 */
import { __, sprintf } from "@wordpress/i18n";
import { memo } from "@wordpress/element";
/**
 * External dependencies
 */
import classnames from "classnames";

/**
 * Internal dependencies
 */
import Badge from "../ui/Badge";
import Toggle from "../ui/Toggle";
import Button from "../ui/Button";
import ExtensionIcon from "../../icons/extensions";
import { getTabUrl, onTabLinkClick } from "../../routing";

const LockIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
);

const WarningIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M12 9v4M12 17h.01" />
        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    </svg>
);

/**
 * @param {Object}   props
 * @param {Object}   props.extension Registry entry.
 * @param {boolean}  props.locked    Pro entry while Pro is inactive.
 * @param {boolean}  props.active    Current on/off state (toggle or status).
 * @param {boolean}  props.loading   Settings still loading.
 * @param {Function} props.onToggle  ( extension, enabled ) => void.
 * @return {JSX.Element} Extension card.
 */
function ExtensionCard({ extension, locked, active, loading, onToggle }) {
    const { key, title, description, icon, tier, toggle, status, link, doc, warning } = extension;
    const titleId = `eb-ext-${key}`;
    const descId = `eb-ext-desc-${key}`;
    const statusId = `eb-ext-status-${key}`;
    const upgradeUrl = EssentialBlocksLocalize?.upgrade_pro_url;

    let badge = null;
    if (locked) {
        badge = (
            <Badge tone="pro" icon={<LockIcon />}>
                {__("Pro", "essential-blocks")}
            </Badge>
        );
    } else if (tier === "pro") {
        badge = <Badge tone="pro">{__("Pro", "essential-blocks")}</Badge>;
    }

    let stateLabel = null;
    if (!locked && (toggle || status)) {
        stateLabel = (
            <Badge tone={active ? "active" : "neutral"}>
                {active ? __("Active", "essential-blocks") : __("Inactive", "essential-blocks")}
            </Badge>
        );
    } else if (!locked) {
        stateLabel = <Badge tone="always">{__("Always active", "essential-blocks")}</Badge>;
    }

    let control = null;
    if (locked) {
        control = (
            <Button
                variant="secondary"
                size="sm"
                href={upgradeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={sprintf(
                    /* translators: %s: extension name. */
                    __("Upgrade to PRO to unlock %s (opens in a new tab)", "essential-blocks"),
                    title
                )}
            >
                {__("Upgrade", "essential-blocks")}
            </Button>
        );
    } else if (toggle) {
        control = (
            <Toggle
                checked={active}
                disabled={loading}
                onChange={(next) => onToggle(extension, next)}
                labelledBy={titleId}
                describedBy={`${descId} ${statusId}`}
            />
        );
    } else if (link?.tab) {
        control = (
            <Button
                variant="ghost"
                size="sm"
                href={getTabUrl(link.tab)}
                onClick={onTabLinkClick(link.tab)}
            >
                {link.label}
            </Button>
        );
    }

    return (
        <div
            className={classnames("eb-card", "eb-ext-card", {
                "is-locked": locked,
                "is-active": active && !locked,
            })}
        >
            <div className="eb-ext-card__header">
                <span className="eb-ext-card__icon">
                    <ExtensionIcon name={icon} />
                </span>
                <div className="eb-ext-card__badges">
                    {badge}
                    {stateLabel && <span id={statusId}>{stateLabel}</span>}
                </div>
            </div>

            <div className="eb-ext-card__body">
                <h3 className="eb-ext-card__title" id={titleId}>
                    {title}
                </h3>
                <p className="eb-ext-card__description" id={descId}>
                    {description}
                </p>
                {warning && toggle && !locked && (
                    <p className="eb-ext-card__warning">
                        <WarningIcon />
                        <span>{warning}</span>
                    </p>
                )}
            </div>

            {(doc || control) && (
                <div className="eb-ext-card__footer">
                    {doc ? (
                        <a
                            className="eb-ext-card__doc"
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={sprintf(
                                /* translators: %s: extension name. */
                                __("%s documentation (opens in a new tab)", "essential-blocks"),
                                title
                            )}
                        >
                            {__("Documentation", "essential-blocks")}
                        </a>
                    ) : (
                        <span />
                    )}
                    {control}
                </div>
            )}
        </div>
    );
}

export default memo(ExtensionCard);
