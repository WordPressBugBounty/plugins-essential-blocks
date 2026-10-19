/**
 * WordPress dependencies
 */
import { useEffect, useMemo, useRef, useState } from "@wordpress/element";
import { __, sprintf } from "@wordpress/i18n";
import { EB_LINKS } from "../../../controls/src/helpers/ebLinks";

import { applyFilters } from "@wordpress/hooks";

/**
 * External dependencies
 */
import ReactPlayer from "react-player";

/**
 * Internal dependencies
 */
import fileGreen from "../icons/file-icon-green.svg";
import fileBlue from "../icons/file-icon-blue.svg";
import iconCommunity from "../icons/icon-community.svg";
import iconReveiw from "../icons/icon-review.svg";
import playIcon from "../icons/play-icon.svg";
import iconHelp from "../icons/icon-help.svg";

import eblogo from "../../../assets/images/eb-logo.svg";

import Button from "./ui/Button";
import PageHeader from "./ui/PageHeader";
import { useBlocks, getBlockItems } from "./blocks/BlocksContext";
import { useEbSettings, usePeekOption } from "../context/SettingsContext";
import { getExtensions, isExtensionActive } from "../data/extensions";
import { focusTarget, getTabUrl, onTabLinkClick } from "../routing";

const RESOURCES = () => [
    {
        icon: fileBlue,
        title: __("Demo pages", "essential-blocks"),
        text: __("Check out the detailed demo pages to learn about the super useful blocks at a glance.", "essential-blocks"),
        link: EB_LINKS.demos.home,
        label: __("Preview Demos", "essential-blocks"),
    },
    {
        icon: fileGreen,
        title: __("View Knowledgebase", "essential-blocks"),
        text: __("Go through the easy documentation to get familiar with Essential Blocks for Gutenberg.", "essential-blocks"),
        link: EB_LINKS.docs.home,
        label: __("Read Documentation", "essential-blocks"),
    },
    {
        icon: iconHelp,
        title: __("Need Help?", "essential-blocks"),
        text: __("Get in touch with our dedicated support team whenever you face an issue.", "essential-blocks"),
        link: "https://wpdeveloper.com/support",
        label: __("Contact us", "essential-blocks"),
    },
    {
        icon: iconCommunity,
        title: __("Community", "essential-blocks"),
        text: __("Join Essential Blocks' social media community and interact with other users and developers.", "essential-blocks"),
        link: "https://www.facebook.com/groups/wpdeveloper.net/",
        label: __("Get Connected", "essential-blocks"),
    },
    {
        icon: iconReveiw,
        title: __("Show Your Love", "essential-blocks"),
        text: __("Show your love for Essential Blocks by rating us and helping us grow more.", "essential-blocks"),
        link: "https://wpdeveloper.com/review-essential-blocks",
        label: __("Write a Review", "essential-blocks"),
    },
];

/**
 * At-a-glance status: blocks and extensions in use, plan.
 * Uses only data already on the page (blocks context, cached eb_settings).
 *
 * @param {Object}   props
 * @param {Function} props.onShowChangelog Opens the changelog and focuses it.
 * @return {JSX.Element} Status card.
 */
function StatusSummary({ onShowChangelog }) {
    const { blocks, isProActive } = useBlocks();
    const { settings, loading } = useEbSettings();
    const aiSettings = usePeekOption("eb_write_with_ai");
    const extensions = useMemo(getExtensions, []);

    // Same "enabled/all" as the sidebar Blocks badge (navigation/useNavBadges.js):
    // the total includes Pro blocks, which count as not enabled without Pro.
    const blockItems = getBlockItems(blocks, EssentialBlocksLocalize?.all_blocks_default || {}, isProActive);
    const enabledBlocks = blockItems.filter((item) => !item.locked && item.enabled).length;

    // Same rule for extensions: the total includes Pro extensions, which
    // count as inactive without Pro.
    const activeExtensions = extensions.filter(
        (ext) => !(ext.tier === "pro" && !isProActive) && isExtensionActive(ext, settings, aiSettings)
    ).length;

    const proVersion = window.EssentialBlocksProLocalize?.eb_pro_version;

    const items = [
        {
            key: "blocks",
            label: __("Blocks enabled", "essential-blocks"),
            value: `${enabledBlocks}/${blockItems.length}`,
            action: __("Manage blocks", "essential-blocks"),
            tab: "blocks",
        },
        {
            key: "extensions",
            label: __("Extensions active", "essential-blocks"),
            value: loading ? "–" : `${activeExtensions}/${extensions.length}`,
            action: __("Manage extensions", "essential-blocks"),
            tab: "extensions",
        },
        {
            key: "plan",
            // Same anatomy as the other cards: "free / pro" like "73/73".
            label: isProActive && proVersion
                ? __("Free / Pro version", "essential-blocks")
                : __("Free version", "essential-blocks"),
            value: [EssentialBlocksLocalize?.eb_version, isProActive ? proVersion : null]
                .filter(Boolean)
                .map((version) =>
                    sprintf(
                        /* translators: %s: version number. */
                        __("v%s", "essential-blocks"),
                        version
                    )
                )
                .join(" / "),
            ...(isProActive
                ? {
                      action: __("View changelog", "essential-blocks"),
                      anchor: "eb-changelog",
                  }
                : {
                      action: __("Upgrade to PRO", "essential-blocks"),
                      href: EssentialBlocksLocalize?.upgrade_pro_url,
                  }),
        },
    ];

    return (
        <section className="eb-card eb-status-card" aria-labelledby="eb-status-title">
            <h2 className="eb-status-card__title" id="eb-status-title">
                {__("At a glance", "essential-blocks")}
            </h2>
            <div className="eb-status-card__grid">
                {items.map((item) => (
                    <div key={item.key} className="eb-status-card__item">
                        <span className="eb-status-card__value">{item.value}</span>
                        <span className="eb-status-card__label">{item.label}</span>
                        {item.tab && (
                            <a
                                className="eb-status-card__link"
                                href={getTabUrl(item.tab)}
                                onClick={onTabLinkClick(item.tab)}
                            >
                                {item.action}
                            </a>
                        )}
                        {item.anchor && (
                            <a
                                className="eb-status-card__link"
                                href={`#${item.anchor}`}
                                onClick={(event) => {
                                    event.preventDefault();
                                    onShowChangelog?.();
                                }}
                            >
                                {item.action}
                            </a>
                        )}
                        {item.href && (
                            <a
                                className="eb-status-card__link"
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {item.action}
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

export default function TabGeneral() {
    const videoPlayIcon = <img src={playIcon} alt="" />;

    // The latest release notes are shown by default.
    const [changelogToggle, setChangelogToggle] = useState(false);

    // react-player's preview is a focusable div without a role or name:
    // expose it as a named button for keyboard and screen-reader users.
    const videoRef = useRef(null);
    useEffect(() => {
        const root = videoRef.current;
        if (!root) {
            return undefined;
        }
        // The preview is rendered lazily: label it once it appears.
        const label = () => {
            const preview = root.querySelector(".react-player__preview");
            if (preview && !preview.hasAttribute("aria-label")) {
                preview.setAttribute("role", "button");
                preview.setAttribute(
                    "aria-label",
                    __("Play video: Welcome to Essential Blocks", "essential-blocks")
                );
            }
        };
        label();
        const observer = new window.MutationObserver(label);
        observer.observe(root, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, []);

    return (
        <>
            {/* Header and body share one width, so the theme toggle lines up
                with the cards. */}
            <div className="eb-home-page">
            <PageHeader title={__("Dashboard", "essential-blocks")} />
            <div className="eb-home eb-home--stack">
                <div className="eb-home__main">
                    <StatusSummary
                        onShowChangelog={() => {
                            setChangelogToggle(true);
                            focusTarget("eb-changelog");
                        }}
                    />

                    <div className="eb-dash-license-slot">
                        {applyFilters("eb_manage_license")}
                        {applyFilters("eb_bottom_manage_license", "", eblogo)}
                    </div>

                    <section className="eb-admin-block eb-intro-block" aria-labelledby="eb-welcome-title">
                        <div className="eb-intro-block__header">
                            <div>
                                <h2 id="eb-welcome-title">
                                    {__("Welcome To Essential Blocks", "essential-blocks")}
                                </h2>
                                <p className="eb-intro-block__text">
                                    {__(
                                        "Build faster with ready-to-use blocks and extensions for the WordPress block editor.",
                                        "essential-blocks"
                                    )}
                                </p>
                            </div>
                            <div className="eb-intro-block__actions">
                                <Button
                                    href={getTabUrl("blocks")}
                                    onClick={onTabLinkClick("blocks")}
                                >
                                    {__("Manage Blocks", "essential-blocks")}
                                </Button>
                                <Button
                                    variant="secondary"
                                    href={getTabUrl("extensions")}
                                    onClick={onTabLinkClick("extensions")}
                                >
                                    {__("Explore Extensions", "essential-blocks")}
                                </Button>
                            </div>
                        </div>
                        <div className="eb-admin-video-block" ref={videoRef}>
                            <ReactPlayer
                                url="https://www.youtube.com/watch?v=8-hrsbd75Yk"
                                loop={true}
                                muted={true}
                                // No autoplay: the light preview starts it on click.
                                playing={true}
                                controls={true}
                                light={`${EssentialBlocksLocalize.image_url}/admin/intro-video-thmb.jpg`}
                                playIcon={videoPlayIcon}
                                className="eb-react-player"
                                width="100%"
                                height="100%"
                            />
                        </div>
                    </section>

                    {EssentialBlocksLocalize?.is_pro_active === "false" && (
                        <div className="eb-admin-block pro-teaser-block block-flex">
                            <div className="pro-teaser-icon" aria-hidden="true">
                                <svg
                            width="40"
                            height="40"
                            viewBox="0 0 40 40"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M31.6669 15.9666L27.3836 17.0332L22.0336 10.3666C21.7993 10.0746 21.5025 9.83895 21.165 9.67702C20.8275 9.5151 20.4579 9.43103 20.0836 9.43103C19.7092 9.43103 19.3397 9.5151 19.0022 9.67702C18.6647 9.83895 18.3678 10.0746 18.1336 10.3666L12.7836 17.0332L8.41691 15.9666C7.99843 15.8664 7.56125 15.8752 7.14715 15.9922C6.73304 16.1091 6.35584 16.3303 6.05157 16.6346C5.7473 16.9388 5.52613 17.316 5.40918 17.7302C5.29223 18.1443 5.28342 18.5814 5.38358 18.9999L8.33358 29.3666C8.43439 29.7271 8.65363 30.0432 8.95598 30.2639C9.25832 30.4846 9.62617 30.5971 10.0002 30.5833H30.0002C30.3743 30.5971 30.7422 30.4846 31.0445 30.2639C31.3469 30.0432 31.5661 29.7271 31.6669 29.3666L34.6336 18.9999C34.7293 18.5881 34.7198 18.1588 34.6058 17.7516C34.4919 17.3444 34.2772 16.9725 33.9815 16.6702C33.6859 16.368 33.3189 16.145 32.9143 16.022C32.5098 15.8991 32.0808 15.88 31.6669 15.9666Z"
                                fill="#EFA83C"
                            />
                            <path
                                d="M4.58333 14.1667C5.73393 14.1667 6.66667 13.2339 6.66667 12.0833C6.66667 10.9327 5.73393 10 4.58333 10C3.43274 10 2.5 10.9327 2.5 12.0833C2.5 13.2339 3.43274 14.1667 4.58333 14.1667Z"
                                fill="#EFA83C"
                            />
                            <path
                                d="M35.4163 14.1667C36.5669 14.1667 37.4997 13.2339 37.4997 12.0833C37.4997 10.9327 36.5669 10 35.4163 10C34.2657 10 33.333 10.9327 33.333 12.0833C33.333 13.2339 34.2657 14.1667 35.4163 14.1667Z"
                                fill="#EFA83C"
                            />
                            <path
                                d="M20.0003 7.08329C21.1509 7.08329 22.0837 6.15055 22.0837 4.99996C22.0837 3.84937 21.1509 2.91663 20.0003 2.91663C18.8497 2.91663 17.917 3.84937 17.917 4.99996C17.917 6.15055 18.8497 7.08329 20.0003 7.08329Z"
                                fill="#EFA83C"
                            />
                            <path
                                d="M29.9997 36.6666H9.99967C9.55765 36.6666 9.13372 36.491 8.82116 36.1784C8.5086 35.8659 8.33301 35.4419 8.33301 34.9999C8.33301 34.5579 8.5086 34.134 8.82116 33.8214C9.13372 33.5088 9.55765 33.3333 9.99967 33.3333H29.9997C30.4417 33.3333 30.8656 33.5088 31.1782 33.8214C31.4908 34.134 31.6663 34.5579 31.6663 34.9999C31.6663 35.4419 31.4908 35.8659 31.1782 36.1784C30.8656 36.491 30.4417 36.6666 29.9997 36.6666Z"
                                fill="#EFA83C"
                            />
                        </svg>
                            </div>
                            <div className="pro-teaser-content">
                                <h2 className="pro-teaser-title">
                                    {__(
                                        "Upgrade To PRO & Enjoy Advanced Features!",
                                        "essential-blocks"
                                    )}
                                </h2>

                                <p className="pro-teaser-description">
                                    {__(
                                        "Unleash premium blocks and features from Essential Blocks to power up your Gutenberg website today.",
                                        "essential-blocks"
                                    )}
                                </p>

                                <div className="teaser-box">
                                    {/* Light / dark artwork; CSS shows the one matching the theme. */}
                                    <img
                                        className="teaser-img teaser-img--light"
                                        src={`${EssentialBlocksLocalize.image_url}/admin/pro-teaser.jpg`}
                                        alt={__("Essential Blocks PRO blocks preview", "essential-blocks")}
                                        width="587"
                                        height="105"
                                    />
                                    <img
                                        className="teaser-img teaser-img--dark"
                                        src={`${EssentialBlocksLocalize.image_url}/admin/pro-teaser-dark.jpg`}
                                        alt={__("Essential Blocks PRO blocks preview", "essential-blocks")}
                                        width="587"
                                        height="105"
                                        loading="lazy"
                                    />

                                    <div className="teaser-cta">
                                        <img
                                            src={`${EssentialBlocksLocalize.image_url}/admin/teaser-arrow.png`}
                                            alt=""
                                        />
                                        <Button
                                            href={EssentialBlocksLocalize?.upgrade_pro_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {__("Upgrade To PRO", "essential-blocks")}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Help links: a side column on wide screens, under the main
                    column otherwise (scss/_general.scss). */}
                <div className="eb-home__aside">
                    <div className="eb-home__resources">
                    {RESOURCES().map((resource) => (
                        <div key={resource.link} className="eb-admin-block eb-resource-card">
                            <h3 className="eb-admin-block__title">
                                <img src={resource.icon} alt="" width="22" height="22" />
                                <span>{resource.title}</span>
                            </h3>
                            <p className="eb-admin-block__text">{resource.text}</p>
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={resource.link}
                                className="eb-admin-block__link"
                            >
                                {resource.label}
                                <span className="eb-visually-hidden">
                                    {__("(opens in a new tab)", "essential-blocks")}
                                </span>
                            </a>
                        </div>
                    ))}
                    </div>
                </div>
            </div>
                {/* Changelog sits outside the column grid, so it spans the full
                width and the sticky help column can't overlap it. */}
                <div className="eb-admin-block changelog-block" id="eb-changelog">
                        <h2 className="changelog-heading">
                            <button
                                type="button"
                                className="changelog-header"
                                aria-expanded={changelogToggle}
                                aria-controls="eb-changelog-details"
                                onClick={() => setChangelogToggle(!changelogToggle)}
                            >
                                <span>
                                    {__(
                                        "Get updates on our new blocks and features by checking out the changelog",
                                        "essential-blocks"
                                    )}
                                </span>
                                <span className="changelog-toggle-icon" aria-hidden="true">
                                    {changelogToggle ? "−" : "+"}
                                </span>
                            </button>
                        </h2>

                        {/* The changelog markup below is rewritten by the release
                           script (scripts/config/release-config.yaml): keep the
                           changelog-title / changelog-content structure. */}
                        <div
                            id="eb-changelog-details"
                            className="changelog-details"
                            hidden={!changelogToggle}
                        >
                    <div className="changelog-wrapper">
                        <div className="changelog-title">
                            {__("Version: 6.5.1", "essential-blocks")}
                            <span className="changelog-date">
                                {__("19/10/2026", "essential-blocks")}
                            </span>
                        </div>
                        <ul className="changelog-content">
                            <li>
                                {__(
                                    "Added: Accordion | Title hover font weight",
                                    "essential-blocks"
                                )}
                            </li>
                            <li>
                                {__(
                                    "Added: Write With AI | GPT-5 models",
                                    "essential-blocks"
                                )}
                            </li>
                            <li>
                                {__(
                                    "Revamped: New EB Dashboard for better UI/UX",
                                    "essential-blocks"
                                )}
                            </li>
                            <li>
                                {__(
                                    "Improved: Write With AI | Performance",
                                    "essential-blocks"
                                )}
                            </li>
                            <li>
                                {__(
                                    "Fixed: Block patterns image issue",
                                    "essential-blocks"
                                )}
                            </li>
                            <li>
                                {__(
                                    "Few minor bug fixes & improvements",
                                    "essential-blocks"
                                )}
                            </li>
                        </ul>

                    </div>
                    {applyFilters("eb_admin_general_changelog", "")}
                    <div className="eb_all_changelog_btn">
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://essential-blocks.com/changelog"
                            className="eb-btn eb-btn-border eb-btn-md"
                        >
                            {__("View All Change Log", "essential-blocks")}
                        </a>
                    </div>
                        </div>
                </div>
            </div>
        </>
    );
}
