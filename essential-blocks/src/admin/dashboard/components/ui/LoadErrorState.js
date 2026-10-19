/**
 * Full-section load error with a Retry button.
 *
 * role="alert" is set on the same node for the component's lifetime, so a
 * retry doesn't re-announce it; the Retry button's aria-busy and label say
 * it is retrying.
 */

/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { useRef } from "@wordpress/element";

/**
 * Internal dependencies
 */
import Button from "./Button";

const ErrorIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
    </svg>
);

/**
 * @param {Object}   props
 * @param {string}   props.title        Heading text.
 * @param {*}        props.description  Body text.
 * @param {Function} props.onRetry      Called on Retry (may return a promise).
 * @param {boolean}  props.retrying     Shows the busy state.
 * @param {string}   props.retryLabel   Button label.
 * @param {number}   props.headingLevel 2 or 3.
 * @param {*}        props.details      Optional technical detail.
 * @return {JSX.Element} Load error state.
 */
export default function LoadErrorState({
    title = __("Couldn't load this page", "essential-blocks"),
    description = __(
        "Check your connection and try again. Your settings have not been changed.",
        "essential-blocks"
    ),
    onRetry,
    retrying = false,
    retryLabel = __("Retry", "essential-blocks"),
    headingLevel = 2,
    details,
}) {
    const Heading = headingLevel === 3 ? "h3" : "h2";
    const pending = useRef(false);

    const retry = () => {
        if (retrying || pending.current) {
            return;
        }
        pending.current = true;
        Promise.resolve(onRetry?.()).finally(() => {
            pending.current = false;
        });
    };

    return (
        <div className="eb-empty eb-empty--error eb-load-error" role="alert">
            <div className="eb-empty__icon" aria-hidden="true">
                <ErrorIcon />
            </div>
            <Heading className="eb-empty__title">{title}</Heading>
            {description && <p className="eb-empty__description">{description}</p>}
            {details && <p className="eb-load-error__details">{details}</p>}
            <div className="eb-empty__action">
                <Button
                    variant="primary"
                    loading={retrying}
                    disabled={retrying}
                    onClick={retry}
                >
                    {retrying ? __("Retrying…", "essential-blocks") : retryLabel}
                </Button>
            </div>
        </div>
    );
}
