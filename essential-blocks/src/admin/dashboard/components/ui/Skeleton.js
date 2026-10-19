/**
 * Loading placeholders shaped like the content they replace.
 */
import { __ } from "@wordpress/i18n";

/**
 * @param {Object}          props
 * @param {string|number=}  props.width
 * @param {string|number=}  props.height
 * @param {string=}         props.radius CSS radius (defaults to the small radius).
 * @return {JSX.Element} Skeleton bar.
 */
export default function Skeleton({ width = "100%", height = 14, radius }) {
    return (
        <span
            className="eb-skeleton"
            style={{ width, height, borderRadius: radius }}
            aria-hidden="true"
        />
    );
}

/**
 * Grid of card-shaped skeletons with a single screen-reader status.
 *
 * @param {Object}  props
 * @param {number=} props.count
 * @return {JSX.Element} Skeleton grid.
 */
export function SkeletonCards({ count = 6 }) {
    return (
        <div className="eb-skeleton-grid" role="status">
            <span className="eb-visually-hidden">{__("Loading…", "essential-blocks")}</span>
            {Array.from({ length: count }, (_, i) => (
                <div key={i} className="eb-card eb-skeleton-card" aria-hidden="true">
                    <div className="eb-skeleton-card__row">
                        <Skeleton width={36} height={36} radius="8px" />
                        <Skeleton width={40} height={22} radius="999px" />
                    </div>
                    <Skeleton width="55%" height={16} />
                    <Skeleton width="90%" />
                    <Skeleton width="70%" />
                </div>
            ))}
        </div>
    );
}
