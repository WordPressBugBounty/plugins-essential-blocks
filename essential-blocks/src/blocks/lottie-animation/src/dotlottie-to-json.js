/**
 * Convert a .lottie (dotLottie v1/v2 zip) file to a Lottie JSON blob URL,
 * so it can be rendered by lottie-web exactly like a JSON file.
 *
 * The bundled DotLottie (ThorVG) renderer draws some files incorrectly
 * (e.g. Lottielab exports with many clipped precomps), while lottie-web
 * renders them correctly.
 *
 * Resolves to null when the file can't be converted; callers then fall
 * back to the DotLottie renderer.
 */

const cache = {};

const MIME_TYPES = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
    svg: 'image/svg+xml',
};

const toBase64 = (bytes) => {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(binary);
};

// Minimal zip reader: stored (0) and deflated (8) entries
const readZip = (buffer) => {
    const view = new DataView(buffer);
    let end = -1;
    for (let i = buffer.byteLength - 22; i >= Math.max(0, buffer.byteLength - 65557); i--) {
        if (view.getUint32(i, true) === 0x06054b50) {
            end = i;
            break;
        }
    }
    if (end < 0) {
        throw new Error('Not a zip file');
    }

    const count = view.getUint16(end + 10, true);
    let offset = view.getUint32(end + 16, true);
    const decoder = new TextDecoder();
    const entries = [];

    for (let n = 0; n < count; n++) {
        if (view.getUint32(offset, true) !== 0x02014b50) {
            throw new Error('Bad zip directory');
        }
        const method = view.getUint16(offset + 10, true);
        const size = view.getUint32(offset + 20, true);
        const nameLength = view.getUint16(offset + 28, true);
        const extraLength = view.getUint16(offset + 30, true);
        const commentLength = view.getUint16(offset + 32, true);
        const local = view.getUint32(offset + 42, true);
        const name = decoder.decode(new Uint8Array(buffer, offset + 46, nameLength));
        const dataStart = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
        entries.push({ name, method, data: new Uint8Array(buffer, dataStart, size) });
        offset += 46 + nameLength + extraLength + commentLength;
    }

    return Promise.all(entries.map(({ name, method, data }) => {
        if (method === 0) {
            return [name, data];
        }
        if (method === 8 && typeof DecompressionStream !== 'undefined') {
            const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
            return new Response(stream).arrayBuffer().then((out) => [name, new Uint8Array(out)]);
        }
        return null;
    })).then((list) => {
        const files = {};
        list.forEach((entry) => {
            if (entry) {
                files[entry[0]] = entry[1];
            }
        });
        return files;
    });
};

const buildAnimation = (files) => {
    const decoder = new TextDecoder();
    const manifest = files['manifest.json'] ? JSON.parse(decoder.decode(files['manifest.json'])) : {};
    // dotLottie v2 names its default in `initial.animation`, v1 in `activeAnimationId`.
    const id = manifest.initial?.animation || manifest.activeAnimationId || manifest.animations?.[0]?.id;
    const names = Object.keys(files);
    const key = [`animations/${id}.json`, `a/${id}.json`].find((name) => files[name])
        || names.find((name) => /^(animations|a)\/[^/]+\.json$/.test(name));
    if (!key) {
        throw new Error('No animation in .lottie file');
    }

    const animation = JSON.parse(decoder.decode(files[key]));

    // Embed images, since lottie-web can't read them from the zip
    (animation.assets || []).forEach((asset) => {
        if (!asset.p || asset.e === 1 || asset.p.indexOf('data:') === 0) {
            return;
        }
        const base = asset.p.split('/').pop();
        const file = names.find((name) => /^(images|i)\//.test(name) && name.split('/').pop() === base);
        if (!file) {
            return;
        }
        const type = MIME_TYPES[base.split('.').pop().toLowerCase()] || 'application/octet-stream';
        asset.u = '';
        asset.p = `data:${type};base64,${toBase64(files[file])}`;
        asset.e = 1;
    });

    return URL.createObjectURL(new Blob([JSON.stringify(animation)], { type: 'application/json' }));
};

export const dotLottieToJsonUrl = (url) => {
    if (!cache[url]) {
        cache[url] = fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.arrayBuffer();
            })
            .then(readZip)
            .then(buildAnimation)
            .catch(() => null);
    }
    return cache[url];
};

export const isDotLottieUrl = (url) => typeof url === 'string' && url.toLowerCase().split('?')[0].endsWith('.lottie');
