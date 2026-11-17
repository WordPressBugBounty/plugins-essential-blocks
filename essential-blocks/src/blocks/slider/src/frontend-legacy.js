/**
 * Slider — legacy (v1) frontend runtime.
 *
 * Sliders saved before the v2 markup (no `data-version`, or "v1") are
 * rendered by React with react-slick. Only those pages need React, ReactDOM
 * and the vendor bundle, so this lives in its own entry, enqueued by
 * Slider::render_callback() only when the saved markup is v1. v2+ sliders use
 * the jQuery slick runtime in frontend.js.
 */
import { createRoot, createRef } from "@wordpress/element";
import domReady from "@wordpress/dom-ready";
/**
 * External dependencies
 */
import Slider from "react-slick";

const ebFrontend = window.eb_frontend || {};
const EBRenderIconWithSVG = ebFrontend.EBRenderIconWithSVG || (() => "");
const loadSvgIcons = ebFrontend.loadSvgIcons || (() => {});

domReady(function () {
    const wrappers = document.getElementsByClassName("eb-slider-wrapper");

    for (let wrapper of wrappers) {
        let version = wrapper.getAttribute("data-version");

        if (version == null || version === "v1") {
            let settings = JSON.parse(wrapper.getAttribute("data-settings"));
            let images = JSON.parse(wrapper.getAttribute("data-images"));
            let sliderContentType = wrapper.getAttribute(
                "data-sliderContentType",
            );
            let sliderType = wrapper.getAttribute("data-sliderType");
            let textAlign = wrapper.getAttribute("data-textAlign");
            let arrowNextIcon = wrapper.getAttribute("data-arrowNextIcon");
            let arrowPrevIcon = wrapper.getAttribute("data-arrowPrevIcon");
            let TitleTag = wrapper.getAttribute("data-titleTag") || "h2";
            let ContentTag = wrapper.getAttribute("data-contentTag") || "p";

            const slider = createRef();

            const SampleNextArrow = (props) => {
                const { className, style, onClick, arrowNextIcon } = props;
                return (
                    <div
                        className={className}
                        style={{ ...style, display: "block" }}
                        onClick={onClick}
                    >
                        {EBRenderIconWithSVG(arrowNextIcon)}
                    </div>
                );
            };

            const SamplePrevArrow = (props) => {
                const { className, style, onClick, arrowPrevIcon } = props;
                return (
                    <div
                        className={className}
                        style={{ ...style, display: "block" }}
                        onClick={onClick}
                    >
                        {EBRenderIconWithSVG(arrowPrevIcon)}
                    </div>
                );
            };

            settings.nextArrow = (
                <SampleNextArrow arrowNextIcon={arrowNextIcon} />
            );
            settings.prevArrow = (
                <SamplePrevArrow arrowPrevIcon={arrowPrevIcon} />
            );

            const sliderTypeClass =
                sliderType === "content"
                    ? "eb-slider-type-content"
                    : "eb-slider-type-image";

            const SliderComponent = () => (
                <Slider
                    ref={slider}
                    {...settings}
                    key={`${settings.autoplay}-${settings.adaptiveHeight}`}
                    className={sliderTypeClass}
                >
                    {images.map((image) => (
                        <div className={`eb-slider-item ${sliderContentType}`}>
                            {sliderType === "image" &&
                                image.buttonUrl &&
                                image.isValidUrl && (
                                    <>
                                        <a
                                            href={
                                                image.buttonUrl &&
                                                    image.isValidUrl
                                                    ? image.buttonUrl
                                                    : "#"
                                            }
                                            target={
                                                image.openNewTab
                                                    ? "_blank"
                                                    : "_self"
                                            }
                                            rel="noopener"
                                        >
                                            <img
                                                className="eb-slider-image"
                                                src={image.url}
                                                alt={
                                                    image.alt
                                                        ? image.alt
                                                        : image.title
                                                }
                                            />
                                        </a>
                                    </>
                                )}
                            {sliderType === "image" &&
                                !image.buttonUrl &&
                                !image.isValidUrlf && (
                                    <img
                                        className="eb-slider-image"
                                        src={image.url}
                                        alt={
                                            image.alt ? image.alt : image.title
                                        }
                                    />
                                )}
                            {sliderType === "content" && (
                                <>
                                    <img
                                        className="eb-slider-image"
                                        src={image.url}
                                        alt={
                                            image.alt ? image.alt : image.title
                                        }
                                    />
                                    <div
                                        className={`eb-slider-content align-${textAlign} ${sliderContentType === "content-1" && image.enableContentLink && image.contentLink && image.contentLink.length > 0 && image.isContentUrlValid ? 'has-content-link' : ''}`}
                                        data-content-link={sliderContentType === "content-1" && image.enableContentLink && image.contentLink && image.contentLink.length > 0 && image.isContentUrlValid ? image.contentLink : ''}
                                        data-content-target={sliderContentType === "content-1" && image.contentOpenNewTab ? '_blank' : '_self'}
                                    >
                                        {image.title &&
                                            image.title.length > 0 && (
                                                <>
                                                    <TitleTag
                                                        className="eb-slider-title"
                                                        dangerouslySetInnerHTML={{
                                                            __html: image.title,
                                                        }}
                                                    ></TitleTag>
                                                </>
                                            )}
                                        {image.subtitle &&
                                            image.subtitle.length > 0 && (
                                                <ContentTag
                                                    className="eb-slider-subtitle"
                                                    dangerouslySetInnerHTML={{
                                                        __html: image.subtitle,
                                                    }}
                                                ></ContentTag>
                                            )}
                                        <div className="eb-slider-button-wrapper">
                                            {image.showButton &&
                                                image.buttonText &&
                                                image.buttonText.length > 0 && (
                                                    <a
                                                        href={
                                                            image.buttonUrl &&
                                                                image.isValidUrl
                                                                ? image.buttonUrl
                                                                : "#"
                                                        }
                                                        className="eb-slider-button"
                                                        target={
                                                            image.openNewTab
                                                                ? "_blank"
                                                                : "_self"
                                                        }
                                                        rel="noopener"
                                                        dangerouslySetInnerHTML={{
                                                            __html: image.buttonText,
                                                        }}
                                                    ></a>
                                                )}

                                            {image.showSecondButton &&
                                                image.secondButtonText &&
                                                image.secondButtonText.length >
                                                0 && (
                                                    <a
                                                        href={
                                                            image.secondButtonUrl &&
                                                                image.isValidUrl
                                                                ? image.secondButtonUrl
                                                                : "#"
                                                        }
                                                        className="eb-slider-second-button"
                                                        target={
                                                            image.secondButtonOpenNewTab
                                                                ? "_blank"
                                                                : "_self"
                                                        }
                                                        rel="noopener"
                                                        dangerouslySetInnerHTML={{
                                                            __html: image.secondButtonText,
                                                        }}
                                                    ></a>
                                                )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </Slider>
            );

            const rootElement =
                document.getElementsByClassName("eb-slider-wrapper")[0];
            if (rootElement) {
                const root = createRoot(rootElement);
                root.render(<SliderComponent />);

                // Handle SVG URL loading after render
                setTimeout(() => {
                    loadSvgIcons(rootElement);
                }, 100);
            }
        }
    }
});
