/**
 * Coalesce the mount-time sync of generated CSS attributes.
 *
 * Every EB block regenerates its CSS on mount and writes it back to
 * `blockMeta` / `commonStyles` when the stored copy differs. Done with one
 * `setAttributes` per block, each write is its own block-editor store change,
 * and every change makes core re-serialize the whole post (word count, time
 * to read). On a long page with stale CSS that is N full serializations.
 *
 * Queued writes are flushed once per task as a single
 * `updateBlockAttributes( clientIds, attrsByClientId, { uniqueByBlock: true } )`
 * and marked as not persistent, so regenerated CSS alone creates no undo
 * level and does not dirty the post. It is still saved with the next save.
 */

const BLOCK_EDITOR = "core/block-editor";

// registry -> Map( clientId -> attributes ). Keyed by registry so block and
// pattern previews (sub-registries) never dispatch into the wrong store.
const pendingByRegistry = new Map();
let flushScheduled = false;

const flush = () => {
    flushScheduled = false;
    const entries = Array.from(pendingByRegistry.entries());
    pendingByRegistry.clear();

    entries.forEach(([registry, pending]) => {
        const select = registry.select(BLOCK_EDITOR);
        const attributesByClientId = {};
        const clientIds = [];
        pending.forEach((attributes, clientId) => {
            // The block may have been removed before the flush.
            if (select.getBlock(clientId)) {
                clientIds.push(clientId);
                attributesByClientId[clientId] = attributes;
            }
        });
        if (!clientIds.length) {
            return;
        }

        const dispatch = registry.dispatch(BLOCK_EDITOR);
        const apply = () => {
            if (typeof dispatch.__unstableMarkNextChangeAsNotPersistent === "function") {
                dispatch.__unstableMarkNextChangeAsNotPersistent();
            }
            dispatch.updateBlockAttributes(clientIds, attributesByClientId, {
                uniqueByBlock: true,
            });
        };

        if (typeof registry.batch === "function") {
            registry.batch(apply);
        } else {
            apply();
        }
    });
};

/**
 * Whether a queued write for this block is still waiting for the flush.
 * A block that re-renders before the flush should merge into it instead of
 * writing on its own.
 *
 * @param {Object} registry Data registry the block lives in.
 * @param {string} clientId Block client ID.
 * @return {boolean} True when a write is queued.
 */
export const hasQueuedGeneratedStyles = (registry, clientId) =>
    !!clientId && !!pendingByRegistry.get(registry)?.has(clientId);

/**
 * Queue a generated-CSS attribute write for a block.
 *
 * Falls back to `fallbackSetAttributes` when the block is not in the
 * registry's block-editor store (no clientId, or rendered outside a block).
 *
 * @param {Object}   registry              Data registry the block lives in.
 * @param {string}   clientId              Block client ID.
 * @param {Object}   attributes            Attributes to write.
 * @param {Function} fallbackSetAttributes Block's own setAttributes.
 */
export const queueGeneratedStyles = (registry, clientId, attributes, fallbackSetAttributes) => {
    const select = clientId && registry?.select?.(BLOCK_EDITOR);
    if (!select || !select.getBlock(clientId)) {
        fallbackSetAttributes(attributes);
        return;
    }

    let pending = pendingByRegistry.get(registry);
    if (!pending) {
        pending = new Map();
        pendingByRegistry.set(registry, pending);
    }
    pending.set(clientId, { ...pending.get(clientId), ...attributes });

    if (!flushScheduled) {
        flushScheduled = true;
        setTimeout(flush, 0);
    }
};
