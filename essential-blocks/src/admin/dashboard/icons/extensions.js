/**
 * Line icons for Extensions cards (24px grid, currentColor). Paths adapted
 * from Lucide (ISC license).
 */
const PATHS = {
    toolbar: ["M3 5h18v6H3z", "M7 8h.01M11 8h.01M15 8h.01", "M3 15h18M3 19h12"],
    copy: ["M9 9h11v11H9z", "M5 15H4V4h11v1"],
    defaults: ["M12 3l8 4.5v9L12 21l-8-4.5v-9z", "M12 12l8-4.5M12 12v9M12 12L4 7.5"],
    code: ["m16 18 6-6-6-6", "m8 6-6 6 6 6"],
    palette: ["M12 22a10 10 0 1 1 10-10c0 2.8-2.2 3-4 3h-2a2 2 0 0 0-1.5 3.3A2 2 0 0 1 12 22z", "M7.5 10.5h.01M10.5 7.5h.01M15.5 8.5h.01"],
    glass: ["M5 4h14l-1.5 16h-11z", "M6 9c2 1 4 1 6 0s4-1 6 0"],
    mask: ["M3 3h18v18H3z", "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"],
    motion: ["M13 2 3 14h9l-1 8 10-12h-9z"],
    transform: ["M3 3h7v7H3z", "M14 14h7v7h-7z", "M14 6h4a2 2 0 0 1 2 2v2", "M10 18H6a2 2 0 0 1-2-2v-2"],
    cursor: ["M4 4l7 17 2.5-7.5L21 11z", "M13.5 13.5 19 19"],
    video: ["M2 6h14v12H2z", "m16 10 6-4v12l-6-4"],
    layout: ["M3 3h18v18H3z", "M3 9h18M9 21V9"],
    devices: ["M3 4h13v10H3z", "M7 18h6", "M18 8h3v12h-5v-3"],
    schema: ["M4 4h6v6H4z", "M14 14h6v6h-6z", "M7 10v4a3 3 0 0 0 3 3h4"],
    speed: ["M12 14l4-4", "M3.3 18A10 10 0 1 1 20.7 18"],
    ai: ["M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z", "M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"],
    image: ["M3 3h18v18H3z", "M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z", "m21 15-5-5L5 21"],
    eye: ["M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"],
    tags: ["M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z", "M7.5 7.5h.01"],
    lock: ["M4 11h16v10H4z", "M8 11V7a4 4 0 0 1 8 0v4"],
    table: ["M3 3h18v18H3z", "M3 9h18M3 15h18M9 3v18"],
    form: ["M4 3h16v18H4z", "M8 8h8M8 12h8M8 16h5"],
    inbox: ["M22 12h-6l-2 3h-4l-2-3H2", "M5.5 5h13L22 12v7H2v-7z"],
    puzzle: ["M10 3h4v3a2 2 0 1 0 4 0V3h3v7h-3a2 2 0 1 0 0 4h3v7h-7v-3a2 2 0 1 0-4 0v3H3v-7h3a2 2 0 1 0 0-4H3V3z"],
};

/**
 * @param {Object} props
 * @param {string} props.name Icon key, or an image URL (legacy entries).
 * @return {JSX.Element} Icon.
 */
export default function ExtensionIcon({ name }) {
    if (typeof name === "string" && /^(https?:)?\/\//.test(name)) {
        return <img src={name} alt="" width="22" height="22" loading="lazy" />;
    }
    const paths = PATHS[name] || PATHS.puzzle;
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            {paths.map((d) => (
                <path key={d} d={d} />
            ))}
        </svg>
    );
}
