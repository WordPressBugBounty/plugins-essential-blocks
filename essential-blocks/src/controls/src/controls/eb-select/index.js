/**
 * WordPress Dependencies
 */
import { forwardRef, memo } from "@wordpress/element";

/**
 * External Dependencies
 */
import Select from "react-select";
import AsyncSelect from "react-select/async";
import CreatableSelect from "react-select/creatable";

/**
 * z-index of react-select menus portaled to document.body.
 *
 * Above the block editor chrome (the footer bar is z-index 90) and the
 * inspector controls, below WordPress Modal (100000) and Popover (1000000).
 */
export const EB_SELECT_MENU_Z = 9999;

const VARIANTS = {
    select: Select,
    async: AsyncSelect,
    creatable: CreatableSelect,
};

/**
 * react-select with its menu portaled to the page body.
 *
 * Rendered inline, a react-select menu (position: absolute; z-index: 1) is
 * painted under later controls in the same inspector panel that have their own
 * z-index (e.g. ToggleGroupControl buttons, z-index 2), under the editor footer
 * bar, and gets cut off at the bottom of the viewport. Portaled with fixed
 * positioning it sits above all of that, flips upward when there's no room
 * below, and react-select keeps it attached to the control while the sidebar
 * scrolls.
 *
 * Every default can be overridden by the caller's props. A `styles.menuPortal`
 * that sets its own zIndex keeps it; otherwise `menuZIndex` is applied.
 *
 * Constraint: the menu goes to the main document's body at EB_SELECT_MENU_Z.
 * Used inside a WordPress Modal (z-index 100000) or Popover (z-index 1000000)
 * it would render BEHIND that layer — pass a higher `menuZIndex`, or a
 * `menuPortalTarget` inside the modal/popover, there. The block inspector
 * sidebar lives in the main document (not the editor canvas iframe), so the
 * defaults are right for inspector controls.
 *
 * @param {Object}                          props
 * @param {"select"|"async"|"creatable"}    props.variant    react-select component to render.
 * @param {number}                          props.menuZIndex z-index for the portaled menu.
 * @param {Object}                          props.styles     react-select styles; merged with the menuPortal z-index.
 */
const EBSelect = forwardRef(({
    variant = "select",
    menuZIndex = EB_SELECT_MENU_Z,
    styles = {},
    ...props
}, ref) => {
    const SelectComponent = VARIANTS[variant] || Select;
    const callerMenuPortal = styles.menuPortal;

    return (
        <SelectComponent
            ref={ref}
            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
            menuPosition="fixed"
            menuPlacement="auto"
            {...props}
            styles={{
                ...styles,
                menuPortal: (base, state) => {
                    const menuPortalStyles = callerMenuPortal ? callerMenuPortal(base, state) : base;

                    return menuPortalStyles.zIndex !== undefined && menuPortalStyles.zIndex !== base.zIndex
                        ? menuPortalStyles
                        : { ...menuPortalStyles, zIndex: menuZIndex };
                },
            }}
        />
    );
});

export default memo(EBSelect);
