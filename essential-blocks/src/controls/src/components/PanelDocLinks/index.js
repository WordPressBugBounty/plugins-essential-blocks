/**
 * "Documentation · Live demo" links at the bottom of an inspector panel.
 */
import { __ } from "@wordpress/i18n";

const NewTabNotice = () => (
    <span className="screen-reader-text">
        {__("(opens in a new tab)", "essential-blocks")}
    </span>
);

const PanelDocLinks = ({ doc, demo }) => {
    if (!doc && !demo) {
        return null;
    }

    return (
        <p className="eb-panel-doc-links">
            {doc && (
                <a href={doc} target="_blank" rel="noopener noreferrer">
                    {__("Documentation", "essential-blocks")}
                    <NewTabNotice />
                </a>
            )}
            {demo && (
                <a href={demo} target="_blank" rel="noopener noreferrer">
                    {__("Live demo", "essential-blocks")}
                    <NewTabNotice />
                </a>
            )}
        </p>
    );
};

export default PanelDocLinks;
