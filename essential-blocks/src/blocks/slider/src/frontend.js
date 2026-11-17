import domReady from "@wordpress/dom-ready";

/**
 * Get SVG functions from global eb_frontend.
 * Fall back to no-ops if the controls frontend bundle didn't load
 * (e.g. blocked by a firewall/optimizer) so the slider still initializes.
 */
const ebFrontend = window.eb_frontend || {};
const loadSvgIcons = ebFrontend.loadSvgIcons || (() => {});
const generateArrowHTML = ebFrontend.generateArrowHTML || (() => "");

/**
 * Let slide buttons and content links navigate instead of opening the lightbox.
 * A button without a URL still opens the lightbox, as before.
 *
 * @param {Object} lightbox Slick Lightbox instance.
 * @param {Object} $item    Clicked slide (jQuery).
 * @param {Object} event    Click event.
 * @return {boolean} Whether the lightbox should open.
 */
const shouldOpenLightbox = (lightbox, $item, event) => {
    const button = event.target.closest(".eb-slider-button, .eb-slider-second-button");
    if (button && button.getAttribute("href")) {
        return false;
    }
    return !event.target.closest(".has-content-link");
};

/**
 * Keep focus out of slides that Slick hides from assistive technology.
 *
 * Slick gives every slide a tabindex, so pressing a slide (click or drag)
 * focuses the slide itself. On the next change Slick sets aria-hidden="true"
 * on that slide while it still holds focus, and Chrome blocks the attribute
 * with a warning. Move focus to the slide list instead: it stays visible,
 * already handles Slick's arrow keys, and Tab from it reaches the active slide.
 *
 * Watches the slider root, so it keeps working when Slick rebuilds the list
 * and track at a responsive breakpoint.
 *
 * @param {HTMLElement} sliderEl Element Slick was initialized on.
 */
const keepFocusOutOfHiddenSlides = (sliderEl) => {
    const releaseFocus = () => {
        const focused = sliderEl.ownerDocument.activeElement;
        const hiddenSlide = focused?.closest?.('.slick-slide[aria-hidden="true"]');
        if (!hiddenSlide || !sliderEl.contains(hiddenSlide)) {
            return;
        }

        const list = sliderEl.querySelector(":scope > .slick-list");
        if (!list) {
            return;
        }
        if (!list.hasAttribute("tabindex")) {
            list.setAttribute("tabindex", "-1");
        }
        list.focus({ preventScroll: true });
    };

    new MutationObserver(releaseFocus).observe(sliderEl, {
        subtree: true,
        attributes: true,
        attributeFilter: ["aria-hidden"],
    });
    sliderEl.addEventListener("focusin", releaseFocus);
};

domReady(function () {
    //Execute after DOM loads.
    const wrappers = document.getElementsByClassName("eb-slider-wrapper");

    for (let wrapper of wrappers) {
        let version = wrapper.getAttribute("data-version");

        // v1 (no data-version / "v1") sliders are rendered by frontend-legacy.js,
        // enqueued only for that markup.

        if (version === "v2") {
            let blockId = wrapper
                .getAttribute("data-blockid")
                .replaceAll("-", "_");
            let settings = window[`${blockId}`];
            let arrowNextIcon = wrapper.getAttribute("data-arrowNextIcon");
            let arrowPrevIcon = wrapper.getAttribute("data-arrowPrevIcon");
            let showLightbox = wrapper.getAttribute("data-lightbox");

            settings.prevArrow = generateArrowHTML(arrowPrevIcon, 'prev');
            settings.nextArrow = generateArrowHTML(arrowNextIcon, 'next');

            let slickType = wrapper.querySelector(".eb-slider-init");

            jQuery(slickType).slick(settings);
            keepFocusOutOfHiddenSlides(slickType);

            // Load SVG icons for v2
            setTimeout(() => {
                loadSvgIcons(wrapper);
            }, 100);

            if (showLightbox == "true") {
                jQuery(slickType).slickLightbox({
                    src: "data-src",
                    itemSelector: ".eb-slider-item",
                    navigateByKeyboard: true,
                    imageMaxHeight: 0.7,
                    shouldOpen: shouldOpenLightbox,
                });
            }
        }
        if (version === "v3" || version === "v4") {

            let isMarquee = wrapper.classList.contains("marquee-slider");
            let settingsData = atob(wrapper.getAttribute("data-settings"));
            let settings = JSON.parse(settingsData);

            let adaptiveHeight = settings.adaptiveHeight;
            let arrows = settings.arrows;
            let autoplay = settings.autoplay;
            let dots = settings.dots;
            let infinite = settings.infinite;
            let pauseOnHover = settings.pauseOnHover;
            let slideToShowRange = settings.slidesToShow;
            let responsive = settings.responsive;
            let autoplaySpeed = settings.autoplaySpeed;
            let speed = settings.speed;
            let vertical = settings.vertical;
            let rtl = settings.rtl;
            let fade = vertical ? false : settings.fade;

            let arrowNextIcon = wrapper.getAttribute("data-arrowNextIcon");
            let arrowPrevIcon = wrapper.getAttribute("data-arrowPrevIcon");
            let showLightbox = wrapper.getAttribute("data-lightbox");

            if (!isMarquee) {
                let slickType = wrapper.querySelector(".eb-slider-init");

                const isRTL = document.documentElement.dir === "rtl";

                const $slick = jQuery(slickType);


                $slick.slick({
                    lazyLoad: "progressive",
                    arrows,
                    adaptiveHeight,
                    autoplay,
                    autoplaySpeed,
                    dots,
                    fade,
                    infinite,
                    pauseOnHover,
                    slidesToShow: slideToShowRange,
                    speed,
                    vertical,
                    rtl: isRTL,
                    prevArrow: generateArrowHTML(arrowPrevIcon, 'prev'),
                    nextArrow: generateArrowHTML(arrowNextIcon, 'next'),
                    responsive: [...responsive],
                    cssEase: "linear",
                });
                keepFocusOutOfHiddenSlides(slickType);

                // Load SVG icons for v3/v4
                setTimeout(() => {
                    loadSvgIcons(wrapper);
                }, 100);

                // ✅ Recalculate layout when image is lazy-loaded
                $slick.on(
                    "lazyLoaded",
                    function (event, slick, image, imageSource) {
                        slick.$slider.slick("setPosition");

                        // Force height recalculation for adaptiveHeight
                        if (adaptiveHeight) {
                            setTimeout(function () {
                                slick.$slider.slick("setPosition");
                            }, 50);
                        }
                    },
                );

                // Force height calculation after initialization for adaptiveHeight
                if (adaptiveHeight) {
                    setTimeout(function () {
                        $slick.slick("setPosition");
                    }, 100);
                }

                // Recalculate on slide change for adaptiveHeight
                $slick.on('afterChange', function (event, slick, currentSlide) {
                    if (adaptiveHeight) {
                        slick.$slider.slick('setPosition');
                    }
                });

                if (showLightbox == "true") {
                    $slick.slickLightbox({
                        src: "data-src",
                        itemSelector: ".eb-slider-item",
                        navigateByKeyboard: true,
                        imageMaxHeight: 0.7,
                        shouldOpen: shouldOpenLightbox,
                    });
                }
            }
        }
    }

    // Handle content link clicks for v2+ versions
    function handleContentLinkClick(event) {
        const contentElement = event.currentTarget;
        const contentLink = contentElement.getAttribute('data-content-link');
        const contentTarget = contentElement.getAttribute('data-content-target');

        // Only handle if we have a content link and the click wasn't on a button
        if (contentLink && !event.target.closest('.eb-slider-button-wrapper')) {
            event.preventDefault();

            if (contentTarget === '_blank') {
                window.open(contentLink, '_blank', 'noopener,noreferrer');
            } else {
                window.location.href = contentLink;
            }
        }
    }

    // Add click handlers to all content elements with links
    const contentElements = document.querySelectorAll('.eb-slider-content.has-content-link');
    contentElements.forEach(function (element) {
        element.addEventListener('click', handleContentLinkClick);

        // Add keyboard support
        element.setAttribute('tabindex', '0');
        element.setAttribute('role', 'link');

        element.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleContentLinkClick(event);
            }
        });
    });
});
