/**
 * Image Comparison — frontend runtime (no React).
 *
 * Until 6.5.4 this mounted react-compare-image with createRoot, so every page
 * with the block loaded React, ReactDOM and the shared vendor bundle for one
 * slider. This builds the same DOM react-compare-image 3.4.0 renders — the
 * `data-testid="container"` box, right/left <img>, the slider (line, handle,
 * line) and the label containers, with the same inline styles — so the
 * per-block CSS (`div[data-testid="container"] > div:nth-child(4) div` …) and
 * style.scss apply unchanged, and mirrors its behaviour: drag (mouse/touch),
 * hover mode, vertical mode, label fade while dragging, height from the
 * taller image's aspect ratio, and width tracking via ResizeObserver.
 *
 * Kept helper-free (no object spread / for...of / classes / async) so Babel
 * pulls in no @babel/runtime chunk.
 */
(function () {
    var HANDLE_SIZE = 40;
    var SHADOW =
        "0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)";

    function el(tag, style) {
        var node = document.createElement(tag);
        if (style) {
            setStyle(node, style);
        }
        return node;
    }

    function setStyle(node, style) {
        Object.keys(style).forEach(function (key) {
            node.style[key] = style[key];
        });
    }

    function mount(wrapper) {
        var leftImage = wrapper.getAttribute("data-left-image");
        var rightImage = wrapper.getAttribute("data-right-image");
        var horizontal = wrapper.getAttribute("data-vertical-mode") !== "true";
        var hover = wrapper.getAttribute("data-hover") === "true";
        var showLabels = wrapper.getAttribute("data-show-label") === "true";
        var noHandle = wrapper.getAttribute("data-handle") === "true";
        var lineColor = wrapper.getAttribute("data-line-color") || "#ffffff";
        var lineWidth = parseInt(wrapper.getAttribute("data-line-width"), 10) || 0;
        var positionAttr = wrapper.getAttribute("data-slider-position");
        var position = positionAttr ? Number(positionAttr) / 100 : 0.5;

        // Labels come from spans in the saved markup (WPML-translatable), with
        // the data attributes as a fallback for older saves.
        var beforeEl = wrapper.querySelector(".eb-image-comparison-before-label");
        var afterEl = wrapper.querySelector(".eb-image-comparison-after-label");
        var leftLabel = showLabels ? (beforeEl ? beforeEl.textContent : wrapper.getAttribute("data-left-label")) : null;
        var rightLabel = showLabels ? (afterEl ? afterEl.textContent : wrapper.getAttribute("data-right-label")) : null;

        var width = 0;
        var height = 0;
        var dragging = false;
        var leftLoaded = false;
        var rightLoaded = false;

        var imageBase = {
            display: "block",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            width: "100%"
        };

        var container = el("div", {
            boxSizing: "border-box",
            position: "relative",
            width: "100%",
            height: "0px",
            overflow: "hidden",
            display: "none"
        });
        container.setAttribute("data-testid", "container");

        var right = el("img", imageBase);
        right.setAttribute("data-testid", "right-image");
        right.alt = "";
        var left = el("img", imageBase);
        left.setAttribute("data-testid", "left-image");
        left.alt = "";

        var slider = el("div", {
            alignItems: "center",
            display: "flex",
            flexDirection: horizontal ? "column" : "row",
            height: horizontal ? "100%" : HANDLE_SIZE + "px",
            justifyContent: "center",
            position: "absolute",
            width: horizontal ? HANDLE_SIZE + "px" : "100%"
        });
        if (!hover) {
            slider.style.cursor = horizontal ? "ew-resize" : "ns-resize";
        }
        var lineStyle = {
            background: lineColor,
            boxShadow: SHADOW,
            flex: "0 1 auto",
            height: horizontal ? "100%" : lineWidth + "px",
            width: horizontal ? lineWidth + "px" : "100%"
        };
        var handle;
        if (noHandle) {
            // react-compare-image with an empty custom handle.
            handle = el("div", {
                alignItems: "center",
                boxSizing: "border-box",
                display: "flex",
                flex: "1 0 auto",
                height: "auto",
                justifyContent: "center",
                width: "auto"
            });
        } else {
            handle = el("div", {
                alignItems: "center",
                border: lineWidth + "px solid " + lineColor,
                borderRadius: "100%",
                boxShadow: SHADOW,
                boxSizing: "border-box",
                display: "flex",
                flex: "1 0 auto",
                height: HANDLE_SIZE + "px",
                justifyContent: "center",
                width: HANDLE_SIZE + "px",
                transform: horizontal ? "none" : "rotate(90deg)"
            });
            handle.appendChild(
                el("div", {
                    border: "inset " + 0.15 * HANDLE_SIZE + "px rgba(0,0,0,0)",
                    borderRight: 0.15 * HANDLE_SIZE + "px solid " + lineColor,
                    height: "0px",
                    marginLeft: "-" + 0.25 * HANDLE_SIZE + "px",
                    marginRight: 0.25 * HANDLE_SIZE + "px",
                    width: "0px"
                })
            );
            handle.appendChild(
                el("div", {
                    border: "inset " + 0.15 * HANDLE_SIZE + "px rgba(0,0,0,0)",
                    borderLeft: 0.15 * HANDLE_SIZE + "px solid " + lineColor,
                    height: "0px",
                    marginRight: "-" + 0.25 * HANDLE_SIZE + "px",
                    width: "0px"
                })
            );
        }
        slider.appendChild(el("div", lineStyle));
        slider.appendChild(handle);
        slider.appendChild(el("div", lineStyle));

        container.appendChild(right);
        container.appendChild(left);
        container.appendChild(slider);

        var labelBase = {
            background: "rgba(0, 0, 0, 0.5)",
            color: "white",
            padding: "10px 20px",
            position: "absolute",
            transform: horizontal ? "translate(0,-50%)" : "translate(-50%, 0)",
            transition: "opacity 0.1s ease-out"
        };
        var leftLabelBox = null;
        var rightLabelBox = null;
        var labels = [];
        if (leftLabel) {
            leftLabelBox = el("div", { height: "100%", position: "absolute", width: "100%" });
            var leftLabelEl = el("div", labelBase);
            setStyle(leftLabelEl, {
                left: horizontal ? "5%" : "50%",
                top: horizontal ? "50%" : "3%"
            });
            leftLabelEl.textContent = leftLabel;
            leftLabelBox.appendChild(leftLabelEl);
            container.appendChild(leftLabelBox);
            labels.push(leftLabelEl);
        }
        if (rightLabel) {
            rightLabelBox = el("div", { height: "100%", position: "absolute", width: "100%" });
            var rightLabelEl = el("div", labelBase);
            if (horizontal) {
                setStyle(rightLabelEl, { right: "5%", top: "50%" });
            } else {
                setStyle(rightLabelEl, { left: "50%", bottom: "3%" });
            }
            rightLabelEl.textContent = rightLabel;
            rightLabelBox.appendChild(rightLabelEl);
            container.appendChild(rightLabelBox);
            labels.push(rightLabelEl);
        }

        function paint() {
            var leftClip = horizontal
                ? "rect(auto, " + width * position + "px, auto, auto)"
                : "rect(auto, auto, " + height * position + "px, auto)";
            var rightClip = horizontal
                ? "rect(auto, auto, auto, " + width * position + "px)"
                : "rect(" + height * position + "px, auto, auto, auto)";
            container.style.height = height + "px";
            left.style.clip = leftClip;
            right.style.clip = rightClip;
            if (leftLabelBox) {
                leftLabelBox.style.clip = leftClip;
            }
            if (rightLabelBox) {
                rightLabelBox.style.clip = rightClip;
            }
            slider.style.left = horizontal ? width * position - HANDLE_SIZE / 2 + "px" : "0px";
            slider.style.top = horizontal ? "0px" : height * position - HANDLE_SIZE / 2 + "px";
            labels.forEach(function (label) {
                label.style.opacity = dragging ? "0" : "1";
            });
        }

        function ready() {
            return leftLoaded && rightLoaded;
        }

        // Height follows the taller image's aspect ratio (react-compare-image
        // `aspectRatio: "taller"`).
        function measure() {
            if (!ready()) {
                return;
            }
            var ratioL = left.naturalHeight / left.naturalWidth || 0;
            var ratioR = right.naturalHeight / right.naturalWidth || 0;
            height = width * Math.max(ratioL, ratioR);
            paint();
        }

        function move(e) {
            var point = e.touches ? e.touches[0] : e;
            var rect = right.getBoundingClientRect();
            var pos = horizontal ? point.clientX - rect.left : point.clientY - rect.top;
            var min = lineWidth / 2;
            var max = (horizontal ? width : height) - lineWidth / 2;
            if (pos < min) {
                pos = min;
            }
            if (pos > max) {
                pos = max;
            }
            var size = horizontal ? width : height;
            if (size > 0) {
                position = pos / size;
            }
            paint();
        }

        function startDrag(e) {
            dragging = true;
            if (!("touches" in e)) {
                e.preventDefault();
            }
            move(e);
            window.addEventListener("mousemove", move);
            window.addEventListener("touchmove", move);
        }

        function stopDrag() {
            dragging = false;
            window.removeEventListener("mousemove", move);
            window.removeEventListener("touchmove", move);
            paint();
        }

        var bound = false;
        function onLoaded() {
            if (!ready()) {
                return;
            }
            container.style.display = "block";
            width = container.getBoundingClientRect().width;
            measure();
            if (bound) {
                return;
            }
            bound = true;
            container.addEventListener("touchstart", startDrag);
            window.addEventListener("touchend", stopDrag);
            if (hover) {
                container.addEventListener("mousemove", move);
                container.addEventListener("mouseleave", stopDrag);
            } else {
                container.addEventListener("mousedown", startDrag);
                window.addEventListener("mouseup", stopDrag);
            }
        }

        left.addEventListener("load", function () {
            leftLoaded = true;
            onLoaded();
        });
        right.addEventListener("load", function () {
            rightLoaded = true;
            onLoaded();
        });

        if (typeof ResizeObserver !== "undefined") {
            new ResizeObserver(function (entries) {
                width = entries[0].target.getBoundingClientRect().width;
                measure();
            }).observe(container);
        }

        // createRoot().render() replaced the wrapper's saved children; do the same.
        while (wrapper.firstChild) {
            wrapper.removeChild(wrapper.firstChild);
        }
        wrapper.appendChild(container);

        // Set src after the load listeners, so cached images still report.
        right.src = rightImage;
        left.src = leftImage;
        if (right.complete && right.naturalWidth) {
            rightLoaded = true;
        }
        if (left.complete && left.naturalWidth) {
            leftLoaded = true;
        }
        onLoaded();
    }

    function init() {
        var wrappers = document.getElementsByClassName("eb-image-comparison-wrapper");
        Array.prototype.slice.call(wrappers).forEach(mount);
    }

    // Also when this script runs after DOMContentLoaded (deferred / delayed JS).
    if (document.readyState !== "loading") {
        init();
    } else {
        window.addEventListener("DOMContentLoaded", init);
    }
})();
