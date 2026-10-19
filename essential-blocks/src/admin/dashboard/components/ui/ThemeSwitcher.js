/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { useEffect, useState } from "@wordpress/element";

/**
 * External dependencies
 */
import classnames from "classnames";

/**
 * Internal dependencies
 */
import { getThemePreference, setTheme, subscribe } from "../../theme";

const SunIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
);

const MoonIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

/**
 * Light / dark toggle: one button. It shows the icon of the theme it
 * switches to, and is a pressed toggle named "Dark mode" for assistive tech.
 *
 * @param {Object} props
 * @param {string} props.className Extra class.
 * @return {JSX.Element} Theme toggle.
 */
export default function ThemeSwitcher({ className }) {
    const [theme, setThemeState] = useState(getThemePreference);

    useEffect(
        () =>
            subscribe((resolved, preference) => {
                setThemeState(preference ?? getThemePreference());
            }),
        []
    );

    const isDark = theme === "dark";
    const hint = isDark
        ? __("Switch to light mode", "essential-blocks")
        : __("Switch to dark mode", "essential-blocks");

    return (
        <button
            type="button"
            className={classnames("eb-theme-switcher", className)}
            aria-pressed={isDark}
            aria-label={__("Dark mode", "essential-blocks")}
            title={hint}
            onClick={() => setTheme(isDark ? "light" : "dark")}
        >
            {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
    );
}
