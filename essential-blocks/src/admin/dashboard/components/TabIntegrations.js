/**
 * WordPress dependencies
 */
import { __, sprintf } from "@wordpress/i18n";
import { useEffect } from "@wordpress/element";

/**
 * Internal dependencies
 */
import betterDocs from "../icons/intregrations/bd.svg";
import betterlinks from "../icons/intregrations/btl.svg";
import easyjobs from "../icons/intregrations/ej.svg";
import embedpress from "../icons/intregrations/ep.svg";
import notificationx from "../icons/intregrations/nx.svg";
import betterPayment from "../icons/intregrations/bp.svg";
import scheduledPress from "../icons/intregrations/wscp.svg";
import essentialAddons from "../icons/intregrations/ea.svg";
import thinkrank from "../icons/intregrations/thinkrank.svg";
import xspeed from "../../../assets/images/admin/logo-xspeed.svg";

import PageHeader from "./ui/PageHeader";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import { useToast } from "../context/ToastContext";
import usePluginInstaller from "../hooks/usePluginInstaller";
import { Section } from "./ui/Page";
import ConnectedServices from "./integrations/ConnectedServices";
import { getRouteParams } from "../routing";

const integrations = [
    {
        slug: "xspeed",
        basename: "xspeed/xspeed.php",
        logo: xspeed,
        title: "xSpeed Cache",
        desc: __(
            "Improve website performance with caching, optimization, and built-in performance tools.",
            "essential-blocks"
        ),
    },
    {
        slug: "thinkrank",
        basename: "thinkrank/thinkrank.php",
        logo: thinkrank,
        title: "ThinkRank AI SEO",
        desc: __(
            "Improve WordPress SEO with metadata optimization, schema markup, sitemaps, and AI-assisted SEO tools.",
            "essential-blocks"
        ),
    },
    {
        slug: "betterdocs",
        basename: "betterdocs/betterdocs.php",
        logo: betterDocs,
        title: "BetterDocs",
        desc: __(
            "BetterDocs will help you to create & organize your documentation page in a beautiful way that will make your visitors find any help article easily.",
            "essential-blocks"
        ),
    },
    {
        slug: "embedpress",
        basename: "embedpress/embedpress.php",
        logo: embedpress,
        title: "EmbedPress",
        desc: __(
            "EmbedPress lets you embed videos, images, posts, audio, maps and upload PDF, DOC, PPT & all other types of content into your WordPress site.",
            "essential-blocks"
        ),
    },
    {
        slug: "betterlinks",
        basename: "betterlinks/betterlinks.php",
        logo: betterlinks,
        title: "BetterLinks",
        desc: __(
            "Best Link Shortening tool to create, shorten and manage any URL to help you cross-promote your brands & products. Gather analytics reports, run successfully marketing campaigns easily & many more.",
            "essential-blocks"
        ),
    },
    {
        slug: "notificationx",
        basename: "notificationx/notificationx.php",
        logo: notificationx,
        title: "NotificationX",
        desc: __(
            "Best FOMO Social Proof Plugin to boost your sales conversion. Create stunning Sales Popup & Notification Bar With Elementor Support.",
            "essential-blocks"
        ),
    },
    {
        slug: "easyjobs",
        basename: "easyjobs/easyjobs.php",
        logo: easyjobs,
        title: "easy.jobs",
        desc: __(
            "Easy solution for the job recruitment to attract, manage & hire right talent faster. The Best Talent Recruitment Suite which lets you manage jobs & career page in Elementor.",
            "essential-blocks"
        ),
    },
    {
        slug: "wp-scheduled-posts",
        basename: "wp-scheduled-posts/wp-scheduled-posts.php",
        logo: scheduledPress,
        title: "SchedulePress",
        desc: __(
            "Best Content Marketing Tool For WordPress – Schedule, Organize, & Auto Share Blog Posts. Take a quick glance at your content planning with Schedule Calendar, Auto & Manual Scheduler and  more.",
            "essential-blocks"
        ),
    },
    {
        slug: "essential-addons-for-elementor-lite",
        basename:
            "essential-addons-for-elementor-lite/essential_adons_elementor.php",
        logo: essentialAddons,
        title: "Essential Addons for Elementor",
        desc: __(
            "Powerful Elementor widgets library with 100+ advanced, fully customizable elements & extensions to enhance your website designing experience.",
            "essential-blocks"
        ),
    },
    {
        slug: "better-payment",
        basename: "better-payment/better-payment.php",
        logo: betterPayment,
        title: "Better Payment",
        desc: __(
            "Better Payment streamlines transactions in Elementor, integrating PayPal, Stripe, advanced analytics, validation, and Elementor forms for the most secure & efficient payments.",
            "essential-blocks"
        ),
    },
];

// Module scope, so the array is stable across renders.
const BASENAMES = integrations.map((item) => item.basename);

export default function TabIntegrations() {
    const { show } = useToast();
    const { entries, install, isBusy } = usePluginInstaller(BASENAMES);

    // Deep link: &section=connected|recommended scrolls to and focuses it.
    useEffect(() => {
        const section = getRouteParams().section;
        if (section === "connected" || section === "recommended") {
            window.requestAnimationFrame(() => {
                document.getElementById(section)?.scrollIntoView({ block: "start" });
                document.getElementById(`${section}-title`)?.focus({ preventScroll: true });
            });
        }
    }, []);

    const installIntegration = (item) => {
        const { status } = entries[item.basename];
        if (status === "active" || isBusy(item.basename)) {
            return;
        }

        // The shared store reports ok only when the installer really
        // succeeded (a wrapped {success:true,data:{success:false}} is a failure).
        install(item.slug, item.basename).then((result) => {
            if (result.ok) {
                show({
                    message: sprintf(
                        /* translators: %s: plugin name. */
                        __("%s is installed and activated.", "essential-blocks"),
                        item.title
                    ),
                });
            } else {
                show({
                    type: "error",
                    message: sprintf(
                        /* translators: %s: plugin name. */
                        __("Couldn't activate %s. Please try again.", "essential-blocks"),
                        item.title
                    ),
                });
            }
        });
    };

    const buttonProps = (state) => {
        switch (state) {
            case "active":
                return { label: __("Activated", "essential-blocks"), variant: "secondary", disabled: true };
            case "inactive":
                return { label: __("Activate", "essential-blocks"), variant: "primary" };
            case "installing":
                return { label: __("Installing…", "essential-blocks"), variant: "primary", loading: true };
            case "activating":
                return { label: __("Activating…", "essential-blocks"), variant: "primary", loading: true };
            default:
                return { label: __("Install", "essential-blocks"), variant: "primary" };
        }
    };

    return (
        <>
            <PageHeader
                title={__("Integrations", "essential-blocks")}
                description={__(
                    "Add more power to your site with other plugins from the WPDeveloper family.",
                    "essential-blocks"
                )}
            />
            <Section
                id="connected"
                title={__("Connected services", "essential-blocks")}
                description={__(
                    "Add API keys for services that Essential Blocks blocks use.",
                    "essential-blocks"
                )}
            >
                <ConnectedServices />
            </Section>
            <Section
                id="recommended"
                title={__("Recommended plugins", "essential-blocks")}
            >
            <div className="eb-card-grid eb-integrations">
                {integrations.map((item) => {
                    const state = entries[item.basename].status;
                    const { label, variant, disabled, loading } = buttonProps(state);
                    return (
                        <div key={item.basename} className="eb-card eb-integration-card">
                            <div className="eb-integration-card__header">
                                <span className="eb-integration-card__icon">
                                    <img src={item.logo} alt="" width="32" height="32" />
                                </span>
                                {state === "active" && (
                                    <Badge tone="active">{__("Active", "essential-blocks")}</Badge>
                                )}
                            </div>
                            <h3 className="eb-integration-card__title">{item.title}</h3>
                            <p className="eb-integration-card__text">{item.desc}</p>
                            <Button
                                variant={variant}
                                disabled={disabled}
                                loading={loading}
                                onClick={() => installIntegration(item)}
                                aria-label={`${label} ${item.title}`}
                            >
                                {label}
                            </Button>
                        </div>
                    );
                })}
            </div>
            </Section>
        </>
    );
}
