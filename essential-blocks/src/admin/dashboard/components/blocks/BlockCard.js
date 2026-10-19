/**
 * One block in the Blocks grid.
 */
/**
 * WordPress dependencies
 */
import { __, sprintf } from "@wordpress/i18n";
import { memo, useEffect, useState } from "@wordpress/element";
/**
 * External dependencies
 */
import classnames from "classnames";

/**
 * Internal dependencies
 */
import Badge from "../ui/Badge";
import Toggle from "../ui/Toggle";
import Tooltip from "../ui/Tooltip";
import Button from "../ui/Button";
import { IconDoc } from "../../icons/blocks/icon-doc";
import { IconDemo } from "../../icons/blocks/icon-demo";

const LockIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
);

const STATUS_LABELS = {
    popular: () => __("Popular", "essential-blocks"),
    new: () => __("New", "essential-blocks"),
    updated: () => __("Updated", "essential-blocks"),
};

/**
 * @param {Object}   props
 * @param {string}   props.blockKey
 * @param {Object}   props.meta     all_blocks_default entry (label, icon, demo, doc, status, is_pro).
 * @param {boolean}  props.enabled
 * @param {boolean}  props.locked   Pro block while Pro is inactive.
 * @param {Function} props.onToggle ( key, enabled ) => void.
 * @param {Function} props.onUnlock Opens the upgrade dialog.
 * @return {JSX.Element} Block card.
 */
function BlockCard({ blockKey, meta, enabled, locked, onToggle, onUnlock }) {
    const titleId = `eb-block-${blockKey}`;
    const statusId = `eb-block-status-${blockKey}`;
    const label = meta?.label || blockKey;
    const statusLabel = STATUS_LABELS[meta?.status]?.();

    // Icons load eagerly (small SVGs; lazy loading left blank squares in
    // full-page captures). A broken or missing icon shows the initial.
    const [iconFailed, setIconFailed] = useState(false);
    useEffect(() => setIconFailed(false), [meta?.icon]);
    const showIcon = !!meta?.icon && !iconFailed;

    return (
        <div
            className={classnames("eb-card", "eb-block-card", {
                "is-enabled": enabled && !locked,
                "is-locked": locked,
            })}
        >
            <div className="eb-block-card__main">
                <span className="eb-block-card__icon">
                    {showIcon ? (
                        <img
                            src={meta.icon}
                            alt=""
                            decoding="async"
                            width="22"
                            height="22"
                            onError={() => setIconFailed(true)}
                        />
                    ) : (
                        <span className="eb-block-card__icon-fallback" aria-hidden="true">
                            {String(label).charAt(0).toUpperCase()}
                        </span>
                    )}
                </span>
                <div className="eb-block-card__text">
                    <h3 className="eb-block-card__title" id={titleId}>
                        {label}
                    </h3>
                    <div className="eb-block-card__meta">
                        {meta?.is_pro && (
                            <Badge tone="pro" icon={locked ? <LockIcon /> : null}>
                                {__("Pro", "essential-blocks")}
                            </Badge>
                        )}
                        {statusLabel && <Badge tone={meta.status}>{statusLabel}</Badge>}
                        {!locked && (
                            <span className="eb-block-card__status" id={statusId}>
                                {enabled
                                    ? __("Enabled", "essential-blocks")
                                    : __("Disabled", "essential-blocks")}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="eb-block-card__actions">
                {meta?.demo && (
                    <Tooltip text={__("Live Demo", "essential-blocks")}>
                        <a
                            className="eb-icon-btn"
                            href={meta.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={sprintf(
                                /* translators: %s: block name. */
                                __("%s live demo (opens in a new tab)", "essential-blocks"),
                                label
                            )}
                        >
                            <IconDemo />
                        </a>
                    </Tooltip>
                )}
                {meta?.doc && (
                    <Tooltip text={__("Documentation", "essential-blocks")}>
                        <a
                            className="eb-icon-btn"
                            href={meta.doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={sprintf(
                                /* translators: %s: block name. */
                                __("%s documentation (opens in a new tab)", "essential-blocks"),
                                label
                            )}
                        >
                            <IconDoc />
                        </a>
                    </Tooltip>
                )}

                {locked ? (
                    <Button
                        variant="secondary"
                        size="sm"
                        className="eb-block-card__unlock"
                        onClick={onUnlock}
                        aria-label={sprintf(
                            /* translators: %s: block name. */
                            __("Unlock %s with PRO", "essential-blocks"),
                            label
                        )}
                    >
                        <LockIcon />
                        {__("Unlock", "essential-blocks")}
                    </Button>
                ) : (
                    <Toggle
                        checked={enabled}
                        onChange={(next) => onToggle(blockKey, next)}
                        labelledBy={titleId}
                        describedBy={statusId}
                    />
                )}
            </div>
        </div>
    );
}

export default memo(BlockCard);
