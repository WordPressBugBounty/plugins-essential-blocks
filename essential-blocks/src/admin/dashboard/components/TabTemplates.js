/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { useEffect, useRef } from "@wordpress/element";

/**
 * External dependencies
 */
import ReactPlayer from "react-player";

/**
 * Internal dependencies
 */
import templatelyLogo from "../icons/templately-logo.svg";
import iconMan from "../icons/iconMan.svg";
import iconBlueCheck from "../icons/iconBlueCheck.svg";
import { LayerRedIcon } from "../icons/layer-red-icon.js";
import playIcon from "../icons/play-icon.svg";

import Button from "./ui/Button";
import PageHeader from "./ui/PageHeader";
import EmptyState from "./ui/EmptyState";
import LoadErrorState from "./ui/LoadErrorState";
import { SkeletonCards } from "./ui/Skeleton";
import { useToast } from "../context/ToastContext";
import usePluginInstaller from "../hooks/usePluginInstaller";
import useTemplatelyPacks from "../hooks/useTemplatelyPacks";

const TEMPLATELY_FILE = "templately/templately.php";
// Module scope, so the array is stable across renders.
const TEMPLATELY_FILES = [TEMPLATELY_FILE];

export default function TabTemplates() {
    const videoPlayIcon = <img src={playIcon} alt="" />;

    // react-player's lazy preview has no role or name: add them when it appears.
    const videoRef = useRef(null);
    useEffect(() => {
        const root = videoRef.current;
        if (!root) {
            return undefined;
        }
        const label = () => {
            const preview = root.querySelector(".react-player__preview");
            if (preview && !preview.hasAttribute("aria-label")) {
                preview.setAttribute("role", "button");
                preview.setAttribute(
                    "aria-label",
                    __("Play video: Templately overview", "essential-blocks")
                );
            }
        };
        label();
        const observer = new window.MutationObserver(label);
        observer.observe(root, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, []);
    const { show } = useToast();

    const { entries, install, isBusy } = usePluginInstaller(TEMPLATELY_FILES);
    const pluginStatus = entries[TEMPLATELY_FILE].status;
    /**
     * 0 = 'not installed', 1 = 'Not activated', 2 = 'Activated'
     */
    let status = 0;
    if (pluginStatus === "active") {
        status = 2;
    } else if (pluginStatus === "inactive" || pluginStatus === "activating") {
        status = 1;
    }
    const loading = isBusy(TEMPLATELY_FILE);

    // loading | ready | empty | error; cached for the page view.
    const {
        status: templatesState,
        packs: templates,
        reload,
    } = useTemplatelyPacks();

    const buttonText = [
        __("Install Templately", "essential-blocks"),
        __("Activate Templately", "essential-blocks"),
        __("Activated", "essential-blocks"),
    ][status];

    const installTemplately = () => {
        if (status === 2) {
            return;
        }
        install("templately", TEMPLATELY_FILE).then((result) => {
            if (result.ok) {
                show({ message: __("Templately is installed and activated.", "essential-blocks") });
            } else {
                show({
                    type: "error",
                    message: __("Couldn't activate Templately. Please try again.", "essential-blocks"),
                });
            }
        });
    };

    const handleTemplateUrl = (slug) => {
        if (status === 2) {
            return (
                EssentialBlocksLocalize.eb_admin_url +
                "admin.php?page=templately&path=gutenberg%2Fpacks"
            );
        } else {
            return "https://templately.com/pack/" + slug;
        }
    };

    const browseTemplates = () => {
        if (status === 2) {
            return (
                EssentialBlocksLocalize.eb_admin_url +
                "admin.php?page=templately&path=gutenberg%2Fpacks"
            );
        } else {
            return "https://templately.com/platform/gutenberg";
        }
    };

    const displayDownloadCount = (number) => {
        if (typeof number !== 'number') {
            number = Number(number)
        }
        if (number >= 1000) {
            return (Math.floor(number / 1000)) + 'k+';
        }
        return number.toString();
    }

    return (
        <>
            <PageHeader title={__("Templates", "essential-blocks")} />
            <div className="eb-admin-grid">
                <div className="eb-col-12">
                    <div className="eb-admin-block eb-templates-intro-block mb30">
                        <div className="eb-admin-grid">
                            <div className="eb-col-5">
                                <img
                                    src={templatelyLogo}
                                    className="temlately-logo"
                                    alt={__("Templately", "essential-blocks")}
                                />
                                <h2>
                                    <span>
                                        {/* {__(templateCount+"+", "essential-blocks")} */}
                                        {__("5000+", "essential-blocks")}
                                    </span>

                                    {__(
                                        " Stunning Templates for WordPress",
                                        "essential-blocks"
                                    )}
                                </h2>
                                <ul>
                                    <li>
                                        <LayerRedIcon></LayerRedIcon>
                                        {__(
                                            "Access Thousands Of Stunning, Ready Website Templates",
                                            "essential-blocks"
                                        )}
                                    </li>
                                    <li>
                                        <img src={iconBlueCheck} alt="" />
                                        {__(
                                            "Save Your Design Anywhere With MyCloud Storage Space",
                                            "essential-blocks"
                                        )}
                                    </li>
                                    <li>
                                        <img src={iconMan} alt="" />
                                        {__(
                                            "Add Team Members & Collaborate On Cloud With Templately WorkSpace",
                                            "essential-blocks"
                                        )}
                                    </li>
                                </ul>
                                <Button
                                    className="eb-install-button"
                                    variant={status === 2 ? "secondary" : "primary"}
                                    disabled={status === 2}
                                    loading={loading}
                                    onClick={installTemplately}
                                >
                                    {buttonText}
                                </Button>
                            </div>
                            <div className="eb-col-7">
                                <div className="eb-admin-video-block" ref={videoRef}>
                                    <ReactPlayer
                                        url="https://www.youtube.com/watch?v=mdPrcpR46GI"
                                        loop={true}
                                        muted={true}
                                        // No autoplay: the light preview starts it on click.
                                        playing={true}
                                        controls={true}
                                        light={`${EssentialBlocksLocalize.image_url}/admin/templately-overlay.jpeg`}
                                        playIcon={videoPlayIcon}
                                        className="eb-react-player"
                                        width="100%"
                                        height="100%"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {templatesState === "loading" && <SkeletonCards count={8} />}

                    {templatesState === "error" && (
                        <LoadErrorState
                            title={__("Couldn't load templates", "essential-blocks")}
                            description={__("Check your connection and try again.", "essential-blocks")}
                            onRetry={reload}
                        />
                    )}

                    {templatesState === "empty" && (
                        <EmptyState
                            title={__("No templates to show right now", "essential-blocks")}
                            action={
                                <Button href={browseTemplates()} target="_blank" rel="noopener noreferrer" variant="secondary">
                                    {__("Browse Templates", "essential-blocks")}
                                </Button>
                            }
                        />
                    )}

                    {templatesState === "ready" && (
                        <>
                            <div className="eb-admin-block">
                                <div className="templates-heading-wrapper eb-block-xs">
                                    <h2 className="eb-templates-heading">
                                        {__(
                                            "Popular Templates",
                                            "essential-blocks"
                                        )}
                                    </h2>
                                </div>

                                <div className="eb-admin-grid eb-templates-wrapper">
                                    {templates.map((item, index) => (
                                        <div
                                            key={item.slug || index}
                                            className="eb-templates-block"
                                        >
                                            <span
                                                className={`label ${item.price == "0"
                                                    ? "starter"
                                                    : "pro"
                                                    } `}
                                            >
                                                {item.price != "0" && (
                                                    <svg
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 16 16"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <g clipPath={`url(#clip0_435_1480-${index})`}>
                                                            <path
                                                                d="M8 4L10.6667 8L14 5.33333L12.6667 12H3.33333L2 5.33333L5.33333 8L8 4Z"
                                                                stroke="white"
                                                                strokeWidth="1.5"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </g>
                                                        <defs>
                                                            <clipPath id={`clip0_435_1480-${index}`}>
                                                                <rect
                                                                    width="16"
                                                                    height="16"
                                                                    fill="white"
                                                                />
                                                            </clipPath>
                                                        </defs>
                                                    </svg>
                                                )}
                                                {item.price == "0"
                                                    ? __("Starter", "essential-blocks")
                                                    : __("Pro", "essential-blocks")}
                                            </span>
                                            <a
                                                href={handleTemplateUrl(
                                                    item.slug
                                                )}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <span className="eb-templates-block__thumb">
                                                    <img
                                                        src={item.thumbnail}
                                                        alt=""
                                                        loading="lazy"
                                                        decoding="async"
                                                        width="400"
                                                        height="300"
                                                    />
                                                </span>
                                                <h3 className="eb-templates-block__name">{item.name}</h3>
                                            </a>

                                            <div className="eb-templates-meta">
                                                <div className="rating">
                                                    <svg
                                                        width="12"
                                                        height="12"
                                                        viewBox="0 0 12 12"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <g clipPath={`url(#clip0_435_1413-${index})`}>
                                                            <path
                                                                d="M4.12151 3.66996L0.931505 4.13246L0.875005 4.14396C0.789475 4.16667 0.711503 4.21167 0.649051 4.27436C0.5866 4.33706 0.541907 4.41521 0.519536 4.50082C0.497165 4.58644 0.497919 4.67647 0.521719 4.7617C0.545519 4.84693 0.591513 4.92432 0.655005 4.98596L2.96601 7.23546L2.42101 10.413L2.41451 10.468C2.40927 10.5564 2.42764 10.6447 2.46773 10.7237C2.50782 10.8027 2.5682 10.8697 2.64267 10.9177C2.71715 10.9657 2.80305 10.9931 2.89158 10.997C2.98011 11.0009 3.06809 10.9812 3.14651 10.94L5.99951 9.43996L8.84601 10.94L8.89601 10.963C8.97854 10.9955 9.06823 11.0054 9.15588 10.9918C9.24354 10.9782 9.326 10.9416 9.3948 10.8856C9.46361 10.8296 9.51628 10.7563 9.54742 10.6733C9.57856 10.5902 9.58705 10.5004 9.57201 10.413L9.02651 7.23546L11.3385 4.98546L11.3775 4.94296C11.4332 4.87435 11.4697 4.79219 11.4834 4.70486C11.497 4.61753 11.4872 4.52815 11.4551 4.44583C11.4229 4.3635 11.3695 4.29118 11.3002 4.23622C11.231 4.18126 11.1485 4.14563 11.061 4.13296L7.87101 3.66996L6.44501 0.779961C6.40374 0.696229 6.33986 0.625719 6.2606 0.576414C6.18134 0.527108 6.08985 0.500977 5.99651 0.500977C5.90316 0.500977 5.81168 0.527108 5.73241 0.576414C5.65315 0.625719 5.58927 0.696229 5.54801 0.779961L4.12151 3.66996Z"
                                                                fill="#F1AF44"
                                                            />
                                                        </g>
                                                        <defs>
                                                            <clipPath id={`clip0_435_1413-${index}`}>
                                                                <rect
                                                                    width="12"
                                                                    height="12"
                                                                    fill="white"
                                                                />
                                                            </clipPath>
                                                        </defs>
                                                    </svg>

                                                    {item?.rating || 5}
                                                </div>
                                                <div className="download">
                                                    <svg
                                                        width="12"
                                                        height="12"
                                                        viewBox="0 0 12 12"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <g clipPath="url(#clip0_435_1418)">
                                                            <path
                                                                d="M9.49999 9.0001C9.96412 9.0001 10.4092 8.81572 10.7374 8.48753C11.0656 8.15935 11.25 7.71423 11.25 7.2501C11.25 6.78597 11.0656 6.34085 10.7374 6.01266C10.4092 5.68447 9.96412 5.5001 9.49999 5.5001H8.99999C9.07295 5.17508 9.07406 4.8403 9.00326 4.5149C8.93247 4.18949 8.79115 3.87982 8.58738 3.60356C8.3836 3.32731 8.12137 3.08988 7.81564 2.90484C7.50991 2.71979 7.16669 2.59076 6.80555 2.5251C6.44441 2.45944 6.07245 2.45844 5.71088 2.52215C5.34932 2.58587 5.00524 2.71306 4.69829 2.89645C4.07838 3.26684 3.64734 3.84369 3.49999 4.5001C2.96697 4.47875 2.44276 4.6353 2.01713 4.94295C1.5915 5.2506 1.29091 5.69021 1.16683 6.18651C1.04276 6.68281 1.10291 7.20494 1.33699 7.66349C1.57108 8.12204 1.96454 8.48849 2.44999 8.7001"
                                                                stroke="#EE8290"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                            <path
                                                                d="M6 6.5V11"
                                                                stroke="#EE8290"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                            <path
                                                                d="M4.5 9.5L6 11L7.5 9.5"
                                                                stroke="#EE8290"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </g>
                                                        <defs>
                                                            <clipPath id="clip0_435_1418">
                                                                <rect
                                                                    width="12"
                                                                    height="12"
                                                                    fill="white"
                                                                />
                                                            </clipPath>
                                                        </defs>
                                                    </svg>
                                                    {displayDownloadCount(item?.downloads || 0)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <a
                                    href={browseTemplates()}
                                    target={status === 2 ? "_self" : "_blank"}
                                    rel="noopener noreferrer"
                                    className="eb-btn eb-btn-primary eb-btn-center"
                                >
                                    {__(
                                        "Browse More Templates",
                                        "essential-blocks"
                                    )}
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
