/**
 * Page template shared by every dashboard tab, plus `Section`.
 *
 * Page = PageHeader (one h1) + optional toolbar + a body that shows exactly
 * one of: loading skeleton, LoadErrorState, EmptyState, or the children.
 */

/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { useEffect, useRef } from "@wordpress/element";

/**
 * External dependencies
 */
import classnames from "classnames";

/**
 * Internal dependencies
 */
import PageHeader from "./PageHeader";
import Button from "./Button";
import EmptyState from "./EmptyState";
import LoadErrorState from "./LoadErrorState";
import { SkeletonCards } from "./Skeleton";

/**
 * @param {Object} props
 * @param {string} props.title       Page title (h1).
 * @param {*}      props.description One-line description.
 * @param {*}      props.actions     Page actions.
 * @param {Object} props.docLink     { href, label } → link button in the actions slot.
 * @param {string} props.titleId     h1 id (default 'eb-page-title').
 * @param {string} props.width       'default' (1280) | 'wide' (1600).
 * @param {*}      props.toolbar     Rendered between header and body.
 * @param {string} props.status      'ready' | 'loading' | 'error' | 'empty'.
 * @param {*}      props.loading     Loading node (default SkeletonCards).
 * @param {Object} props.error       { title, description, onRetry, retrying }.
 * @param {Object} props.empty       { icon, title, description, action }.
 * @param {string} props.className   Extra class.
 * @param {*}      props.children    Ready content.
 * @return {JSX.Element} Page.
 */
export default function Page({
    title,
    description,
    actions,
    docLink,
    titleId = "eb-page-title",
    width = "default",
    toolbar,
    status = "ready",
    loading,
    error,
    empty,
    className,
    children,
}) {
    const errorRef = useRef(null);
    const focusWasInError = useRef(false);
    const previousStatus = useRef(status);

    // The h1 must be focusable (T30 moves focus to it on navigation).
    useEffect(() => {
        document.getElementById(titleId)?.setAttribute("tabindex", "-1");
    }, [titleId]);

    // Error → ready while focus was inside the error slot: move focus to the
    // h1 instead of letting it fall back to <body>.
    useEffect(() => {
        if (
            previousStatus.current === "error" &&
            status !== "error" &&
            focusWasInError.current
        ) {
            document.getElementById(titleId)?.focus();
        }
        focusWasInError.current = false;
        previousStatus.current = status;
    }, [status, titleId]);

    const headerActions =
        actions || docLink ? (
            <>
                {actions}
                {docLink && (
                    <Button
                        variant="link"
                        href={docLink.href}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {docLink.label}
                        <span className="eb-visually-hidden">
                            {__("(opens in a new tab)", "essential-blocks")}
                        </span>
                    </Button>
                )}
            </>
        ) : null;

    let body;
    switch (status) {
        case "loading":
            body = loading || <SkeletonCards />;
            break;
        case "error":
            body = (
                <div
                    ref={errorRef}
                    onFocusCapture={() => {
                        focusWasInError.current = true;
                    }}
                    onBlurCapture={(event) => {
                        if (!errorRef.current?.contains(event.relatedTarget)) {
                            focusWasInError.current = false;
                        }
                    }}
                >
                    <LoadErrorState headingLevel={2} {...(error || {})} />
                </div>
            );
            break;
        case "empty":
            body = <EmptyState {...(empty || {})} />;
            break;
        default:
            body = children;
    }

    return (
        <div
            className={classnames("eb-page", `eb-page--${width}`, className)}
            aria-labelledby={titleId}
        >
            <PageHeader
                title={title}
                description={description}
                actions={headerActions}
                titleId={titleId}
            />
            {toolbar && <div className="eb-page__toolbar">{toolbar}</div>}
            <div
                className="eb-page__body"
                aria-busy={status === "loading" || undefined}
            >
                {body}
            </div>
        </div>
    );
}

/**
 * Titled content group (a named region, deep-linkable by id).
 *
 * @param {Object} props
 * @param {string} props.id           DOM id (deep-link target).
 * @param {string} props.title        Heading text.
 * @param {*}      props.description  Help text.
 * @param {*}      props.actions      Right side of the section header.
 * @param {number} props.headingLevel 2 or 3.
 * @param {string} props.as           'section' | 'div'.
 * @param {string} props.className    Extra class.
 * @param {*}      props.children     Content.
 * @return {JSX.Element} Section.
 */
export function Section({
    id,
    title,
    description,
    actions,
    headingLevel = 2,
    as = "section",
    className,
    children,
}) {
    const Tag = as === "div" ? "div" : "section";
    const Heading = headingLevel === 3 ? "h3" : "h2";
    const titleId = `${id}-title`;

    return (
        <Tag
            id={id}
            className={classnames("eb-section", className)}
            aria-labelledby={Tag === "section" ? titleId : undefined}
        >
            <div className="eb-section__header">
                <div className="eb-section__heading">
                    <Heading id={titleId} className="eb-section__title" tabIndex={-1}>
                        {title}
                    </Heading>
                    {description && (
                        <p className="eb-section__description">{description}</p>
                    )}
                </div>
                {actions && <div className="eb-section__actions">{actions}</div>}
            </div>
            <div className="eb-section__body">{children}</div>
        </Tag>
    );
}
