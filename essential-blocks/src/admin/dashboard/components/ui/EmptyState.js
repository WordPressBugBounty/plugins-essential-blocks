/**
 * Empty / no-results / error view.
 */
import classnames from "classnames";

/**
 * @param {Object}  props
 * @param {*=}      props.icon
 * @param {string}  props.title
 * @param {string=} props.description
 * @param {*=}      props.action      Usually a <Button>.
 * @param {string=} props.tone        "default" | "error".
 * @return {JSX.Element} Empty state.
 */
export default function EmptyState({ icon, title, description, action, tone = "default" }) {
    return (
        <div className={classnames("eb-empty", `eb-empty--${tone}`)}>
            {icon && <div className="eb-empty__icon" aria-hidden="true">{icon}</div>}
            <h3 className="eb-empty__title">{title}</h3>
            {description && <p className="eb-empty__description">{description}</p>}
            {action && <div className="eb-empty__action">{action}</div>}
        </div>
    );
}
