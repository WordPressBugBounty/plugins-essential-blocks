/**
 * WordPress dependencies
 */
import { useBlockProps } from "@wordpress/block-editor";
import { omit } from "lodash";
import {
    sanitizeURL, BlockProps, EBButton,
} from "@essential-blocks/controls";

import attributes from "./attributes";
import {
    LOADMORE_KEYS
} from "./constants";

const deprecated = [
    {
        attributes: omit({ ...attributes }, ['version', 'displayDescription', 'presets', 'lightboxIcon', 'linkIcon', 'imageClickable', 'descriptionColor', 'descriptionBGColor', 'iconType', 'iconColor', 'iconHoverColor', 'iconWidth', 'iconSize', 'contentAlign', 'contentBGColor', 'maskColor', 'filterWrapperBGColor', 'enableSearch', 'unevenWidth', 'notFoundColor', 'notFoundText', 'enableEmptyGrid']),
        supports: {
            align: ["wide", "full"],
        },
        save: ({ attributes }) => {
            const {
                blockId,
                layouts,
                sources,
                displayCaption,
                captionOnHover,
                styleNumber,
                overlayStyle,
                horizontalAlign,
                verticalAlign,
                disableLightBox,
                classHook,
                filterItems,
                enableFilter,
                enableFilterAll,
                filterAllTitle,
                addCustomLink,
                defaultFilter,
                enableIsotope,
                enableLoadMore,
                loadmoreBtnText,
                imagesPerPageCount,
                enableInfiniteScroll
            } = attributes;

            if (sources.length === 0) return null;

            let lightBoxHtml = {
                rel: "noopener",
            };
            if (!disableLightBox) {
                lightBoxHtml = {
                    ...lightBoxHtml,
                    ["data-fslightbox"]: "gallery",
                    ["data-type"]: "image",
                };
            }

            let buttonData = {
                imagesPerPage: imagesPerPageCount,
                loadmore: enableLoadMore,
                infiniteScroll: enableInfiniteScroll,
            }

            return (
                <BlockProps.Save attributes={attributes}>
                    <div
                        className={`eb-parent-wrapper eb-parent-${blockId} ${classHook}`}
                    >
                        {enableFilter && (
                            <ul
                                className={`eb-img-gallery-filter-wrapper filter-wrapper-${blockId}`}
                                data-id={blockId}
                            >
                                {enableFilterAll && (
                                    <li
                                        className="eb-img-gallery-filter-item"
                                        data-filter={"*"}
                                        data-id={blockId}
                                    >
                                        {filterAllTitle !== "" ? filterAllTitle : __("All", "essential-blocks")}
                                    </li>
                                )}
                                {filterItems.map(({ value, label }, index) => {
                                    return (
                                        <li
                                            key={index}
                                            className="eb-img-gallery-filter-item"
                                            data-filter={`.eb-filter-img-${value}`}
                                            data-id={blockId}
                                        >
                                            {label}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                        <div
                            className={`eb-gallery-img-wrapper ${blockId} ${layouts} ${overlayStyle} caption-style-${styleNumber} ${captionOnHover ? "caption-on-hover" : ""
                                } ${enableFilter ? "eb-filterable-img-gallery" : ""} ${enableIsotope ? 'enable-isotope' : 'no-isotope'} ${enableLoadMore ? 'show-loadmore' : ''}`}
                            data-id={blockId}
                            data-default-filter={defaultFilter}
                        >
                            {sources.map((source, index) => {
                                let filters;

                                if (
                                    source.hasOwnProperty("filter") &&
                                    source?.filter?.length > 0
                                ) {
                                    filters = JSON.parse(source.filter);

                                    filters = filters.map((filter) => filter.value);

                                    filters = filters.toString();

                                    filters = filters.replaceAll(
                                        ",",
                                        " eb-filter-img-"
                                    );
                                } else {
                                    filters = "";
                                }

                                let innerHtml = (
                                    <span className="eb-gallery-link-wrapper">
                                        <img
                                            className="eb-gallery-img"
                                            src={source.url}
                                            image-index={index}
                                            alt={source.alt}
                                        />
                                        {displayCaption &&
                                            source.caption &&
                                            source.caption.length > 0 && (
                                                <>
                                                    <span className={`eb-gallery-img-caption ${horizontalAlign} ${verticalAlign}`} dangerouslySetInnerHTML={{ __html: source.caption }}></span>
                                                </>
                                            )}
                                    </span>
                                );

                                if (!addCustomLink) {
                                    return (
                                        <a
                                            key={index}
                                            href={
                                                !disableLightBox
                                                    ? source.url
                                                    : "javascript:void(0)"
                                            }
                                            {...lightBoxHtml}
                                            className={`eb-gallery-img-content eb-filter-img-${filters}`}

                                        >
                                            {innerHtml}
                                        </a>
                                    );
                                }

                                if (addCustomLink) {
                                    return (
                                        <a
                                            key={index}
                                            href={
                                                !disableLightBox
                                                    ? source.url
                                                    : addCustomLink &&
                                                        source.customLink &&
                                                        source.isValidUrl
                                                        ? sanitizeURL(source.customLink)
                                                        : "#"
                                            }
                                            {...lightBoxHtml}
                                            target={
                                                disableLightBox &&
                                                    addCustomLink &&
                                                    source.openNewTab
                                                    ? "_blank"
                                                    : "_self"
                                            }
                                            className={`eb-gallery-img-content eb-filter-img-${filters}`}
                                        >
                                            {innerHtml}
                                        </a>
                                    );
                                }
                            })}
                        </div>

                        {enableLoadMore && (
                            <>
                                <EBButton.Content
                                    attributes={attributes}
                                    type="button"
                                    className={`eb-img-gallery-loadmore ${enableInfiniteScroll ? 'loadmore-disable' : ''}`}
                                    buttonAttrProps={LOADMORE_KEYS}
                                    buttonData={buttonData}
                                    disable={false}
                                    loadingIcon={enableInfiniteScroll ? true : false}
                                />
                            </>
                        )}
                    </div>
                </BlockProps.Save>
            );
        },
    },
    {
        attributes: omit({ ...attributes }, ['enableInfiniteScroll', 'imagesPerPageCount']),
        migrate(attributes) {
            const { imagesPerPage } = attributes;
            const newAttributes = { ...attributes };
            delete newAttributes.imagesPerPage;

            return {
                ...newAttributes,
                imagesPerPageCount: imagesPerPage,
            };
        },
        supports: {
            align: ["wide", "full"],
        },
        save: ({ attributes }) => {
            const {
                blockId,
                layouts,
                sources,
                displayCaption,
                captionOnHover,
                styleNumber,
                overlayStyle,
                horizontalAlign,
                verticalAlign,
                disableLightBox,
                classHook,
                filterItems,
                enableFilter,
                enableFilterAll,
                filterAllTitle,
                addCustomLink,
                defaultFilter,
                enableIsotope,
                enableLoadMore,
                loadmoreBtnText,
                imagesPerPage,
            } = attributes;

            if (sources.length === 0) return null;

            let lightBoxHtml = {
                rel: "noopener",
            };
            if (!disableLightBox) {
                lightBoxHtml = {
                    ...lightBoxHtml,
                    ["data-fslightbox"]: "gallery",
                    ["data-type"]: "image",
                };
            }

            return (
                <div {...useBlockProps.save()}>
                    <div
                        className={`eb-parent-wrapper eb-parent-${blockId} ${classHook}`}
                    >
                        {enableFilter && (
                            <ul
                                className={`eb-img-gallery-filter-wrapper filter-wrapper-${blockId}`}
                                data-id={blockId}
                            >
                                {enableFilterAll && (
                                    <li
                                        className="eb-img-gallery-filter-item"
                                        data-filter={"*"}
                                        data-id={blockId}
                                    >
                                        {filterAllTitle !== "" ? filterAllTitle : "All"}
                                    </li>
                                )}
                                {filterItems.map(({ value, label }, index) => {
                                    return (
                                        <li
                                            key={index}
                                            className="eb-img-gallery-filter-item"
                                            data-filter={`.eb-filter-img-${value}`}
                                            data-id={blockId}
                                        >
                                            {label}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                        <div
                            className={`eb-gallery-img-wrapper ${blockId} ${layouts} ${overlayStyle} caption-style-${styleNumber} ${captionOnHover ? "caption-on-hover" : ""
                                } ${enableFilter ? "eb-filterable-img-gallery" : ""} ${enableIsotope ? 'enable-isotope' : 'no-isotope'} ${enableLoadMore ? 'show-loadmore' : ''}`}
                            data-id={blockId}
                            data-default-filter={defaultFilter}
                        >
                            {sources.map((source, index) => {
                                let filters;

                                if (
                                    source.hasOwnProperty("filter") &&
                                    source.filter.length > 0
                                ) {
                                    filters = JSON.parse(source.filter);

                                    filters = filters.map((filter) => filter.value);

                                    filters = filters.toString();

                                    filters = filters.replaceAll(
                                        ",",
                                        " eb-filter-img-"
                                    );
                                } else {
                                    filters = "";
                                }

                                let innerHtml = (
                                    <span className="eb-gallery-link-wrapper">
                                        <img
                                            className="eb-gallery-img"
                                            src={source.url}
                                            image-index={index}
                                            alt={source.alt}
                                        />
                                        {displayCaption &&
                                            source.caption &&
                                            source.caption.length > 0 && (
                                                <span
                                                    className={`eb-gallery-img-caption ${horizontalAlign} ${verticalAlign}`}
                                                >
                                                    {source.caption}
                                                </span>
                                            )}
                                    </span>
                                );

                                if (!addCustomLink) {
                                    return (
                                        <a
                                            key={index}
                                            href={
                                                !disableLightBox
                                                    ? source.url
                                                    : "javascript:void(0)"
                                            }
                                            {...lightBoxHtml}
                                            className={`eb-gallery-img-content eb-filter-img-${filters}`}

                                        >
                                            {innerHtml}
                                        </a>
                                    );
                                }

                                if (addCustomLink) {
                                    return (
                                        <a
                                            key={index}
                                            href={
                                                !disableLightBox
                                                    ? source.url
                                                    : addCustomLink &&
                                                        source.customLink &&
                                                        source.isValidUrl
                                                        ? source.customLink
                                                        : "#"
                                            }
                                            {...lightBoxHtml}
                                            target={
                                                disableLightBox &&
                                                    addCustomLink &&
                                                    source.openNewTab
                                                    ? "_blank"
                                                    : "_self"
                                            }
                                            className={`eb-gallery-img-content eb-filter-img-${filters}`}
                                        >
                                            {innerHtml}
                                        </a>
                                    );
                                }
                            })}
                        </div>

                        {enableLoadMore && (
                            <button data-images-per-page={imagesPerPage} data-loadmore={enableLoadMore} className="eb-img-gallery-loadmore">{loadmoreBtnText}</button>
                        )}
                    </div>
                </div>
            );
        },
    },
    {
        attributes: { ...attributes },
        supports: {
            align: ["wide", "full"],
        },
        save: ({ attributes }) => {
            const {
                blockId,
                layouts,
                sources,
                displayCaption,
                captionOnHover,
                styleNumber,
                overlayStyle,
                horizontalAlign,
                verticalAlign,
                disableLightBox,
                classHook,
                filterItems,
                enableFilter,
                enableFilterAll,
                filterAllTitle,
                addCustomLink,
                defaultFilter,
                enableIsotope,
                enableLoadMore,
                loadmoreBtnText,
                imagesPerPage,
            } = attributes;

            if (sources.length === 0) return null;

            let lightBoxHtml = {
                id: "eb-gallery-img-content",
            };
            if (!disableLightBox) {
                lightBoxHtml = {
                    ...lightBoxHtml,
                    ["data-fslightbox"]: "gallery",
                    ["data-type"]: "image",
                };
            }

            return (
                <div {...useBlockProps.save()}>
                    <div
                        className={`eb-parent-wrapper eb-parent-${blockId} ${classHook}`}
                    >
                        {enableFilter && (
                            <ul
                                className={`eb-img-gallery-filter-wrapper filter-wrapper-${blockId}`}
                                data-id={blockId}
                            >
                                {enableFilterAll && (
                                    <li
                                        className="eb-img-gallery-filter-item"
                                        data-filter={"*"}
                                        data-id={blockId}
                                    >
                                        {filterAllTitle !== "" ? filterAllTitle : "All"}
                                    </li>
                                )}
                                {filterItems.map(({ value, label }, index) => {
                                    return (
                                        <li
                                            key={index}
                                            className="eb-img-gallery-filter-item"
                                            data-filter={`.eb-filter-img-${value}`}
                                            data-id={blockId}
                                        >
                                            {label}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                        <div
                            className={`eb-gallery-img-wrapper ${blockId} ${layouts} ${overlayStyle} caption-style-${styleNumber} ${captionOnHover ? "caption-on-hover" : ""
                                } ${enableFilter ? "eb-filterable-img-gallery" : ""} ${enableIsotope ? 'enable-isotope' : 'no-isotope'} ${enableLoadMore ? 'show-loadmore' : ''}`}
                            data-id={blockId}
                            data-default-filter={defaultFilter}
                        >
                            {sources.map((source, index) => {
                                let filters;

                                if (
                                    source.hasOwnProperty("filter") &&
                                    source.filter.length > 0
                                ) {
                                    filters = JSON.parse(source.filter);

                                    filters = filters.map((filter) => filter.value);

                                    filters = filters.toString();

                                    filters = filters.replaceAll(
                                        ",",
                                        " eb-filter-img-"
                                    );
                                } else {
                                    filters = "";
                                }

                                let innerHtml = (
                                    <span className="eb-gallery-link-wrapper">
                                        <img
                                            className="eb-gallery-img"
                                            src={source.url}
                                            image-index={index}
                                            alt={source.alt}
                                        />
                                        {displayCaption &&
                                            source.caption &&
                                            source.caption.length > 0 && (
                                                <span
                                                    className={`eb-gallery-img-caption ${horizontalAlign} ${verticalAlign}`}
                                                >
                                                    {source.caption}
                                                </span>
                                            )}
                                    </span>
                                );

                                if (!addCustomLink) {
                                    return (
                                        <a
                                            key={index}
                                            href={
                                                !disableLightBox
                                                    ? source.url
                                                    : "javascript:void(0)"
                                            }
                                            {...lightBoxHtml}
                                            className={`eb-gallery-img-content eb-filter-img-${filters}`}
                                            rel="noopener"
                                        >
                                            {innerHtml}
                                        </a>
                                    );
                                }

                                if (addCustomLink) {
                                    return (
                                        <a
                                            key={index}
                                            href={
                                                !disableLightBox
                                                    ? source.url
                                                    : addCustomLink &&
                                                        source.customLink &&
                                                        source.isValidUrl
                                                        ? sanitizeURL(source.customLink)
                                                        : "#"
                                            }
                                            {...lightBoxHtml}
                                            target={
                                                disableLightBox &&
                                                    addCustomLink &&
                                                    source.openNewTab
                                                    ? "_blank"
                                                    : "_self"
                                            }
                                            className={`eb-gallery-img-content eb-filter-img-${filters}`}
                                            rel="noopener"
                                        >
                                            {innerHtml}
                                        </a>
                                    );
                                }
                            })}
                        </div>

                        {enableLoadMore && (
                            <button data-images-per-page={imagesPerPage} data-loadmore={enableLoadMore} className="eb-img-gallery-loadmore">{loadmoreBtnText}</button>
                        )}
                    </div>
                </div>
            );
        },
    },
    {
        attributes: omit({ ...attributes }, ["enableLoadmore", "loadmoreBtnText", "enableIsotope"]),
        supports: {
            align: ["wide", "full"],
        },
        save: ({ attributes }) => {
            const {
                blockId,
                layouts,
                sources,
                displayCaption,
                captionOnHover,
                styleNumber,
                overlayStyle,
                horizontalAlign,
                verticalAlign,
                disableLightBox,
                classHook,
                filterItems,
                enableFilter,
                enableFilterAll,
                filterAllTitle,
                addCustomLink,
                defaultFilter,
            } = attributes;

            if (sources.length === 0) return null;

            let lightBoxHtml = {
                id: "eb-gallery-img-content",
            };
            if (!disableLightBox) {
                lightBoxHtml = {
                    ...lightBoxHtml,
                    ["data-fslightbox"]: "gallery",
                    ["data-type"]: "image",
                };
            }

            return (
                <div {...useBlockProps.save()}>
                    <div
                        className={`eb-parent-wrapper eb-parent-${blockId} ${classHook}`}
                    >
                        {enableFilter && (
                            <ul
                                className={`eb-img-gallery-filter-wrapper filter-wrapper-${blockId}`}
                                data-id={blockId}
                            >
                                {enableFilterAll && (
                                    <li
                                        className="eb-img-gallery-filter-item"
                                        data-filter={"*"}
                                        data-id={blockId}
                                    >
                                        {filterAllTitle !== "" ? filterAllTitle : "All"}
                                    </li>
                                )}
                                {filterItems.map(({ value, label }, index) => {
                                    return (
                                        <li
                                            key={index}
                                            className="eb-img-gallery-filter-item"
                                            data-filter={`.eb-filter-img-${value}`}
                                            data-id={blockId}
                                        >
                                            {label}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                        <div
                            className={`eb-gallery-img-wrapper ${blockId} ${layouts} ${overlayStyle} caption-style-${styleNumber} ${captionOnHover ? "caption-on-hover" : ""
                                } ${enableFilter ? "eb-filterable-img-gallery" : ""}`}
                            data-id={blockId}
                            data-default-filter={defaultFilter}
                        >
                            {sources.map((source, index) => {
                                let filters;

                                if (
                                    source.hasOwnProperty("filter") &&
                                    source.filter.length > 0
                                ) {
                                    filters = JSON.parse(source.filter);

                                    filters = filters.map((filter) => filter.value);

                                    filters = filters.toString();

                                    filters = filters.replaceAll(
                                        ",",
                                        " eb-filter-img-"
                                    );
                                } else {
                                    filters = "";
                                }

                                let innerHtml = (
                                    <span className="eb-gallery-link-wrapper">
                                        <img
                                            className="eb-gallery-img"
                                            src={source.url}
                                            image-index={index}
                                            alt={source.alt}
                                        />
                                        {displayCaption &&
                                            source.caption &&
                                            source.caption.length > 0 && (
                                                <span
                                                    className={`eb-gallery-img-caption ${horizontalAlign} ${verticalAlign}`}
                                                >
                                                    {source.caption}
                                                </span>
                                            )}
                                    </span>
                                );

                                if (!addCustomLink) {
                                    return (
                                        <a
                                            key={index}
                                            href={
                                                !disableLightBox
                                                    ? source.url
                                                    : "javascript:void(0)"
                                            }
                                            {...lightBoxHtml}
                                            className={`eb-gallery-img-content eb-filter-img-${filters}`}
                                            rel="noopener"
                                        >
                                            {innerHtml}
                                        </a>
                                    );
                                }

                                if (addCustomLink) {
                                    return (
                                        <a
                                            key={index}
                                            href={
                                                !disableLightBox
                                                    ? source.url
                                                    : addCustomLink &&
                                                        source.customLink &&
                                                        source.isValidUrl
                                                        ? sanitizeURL(source.customLink)
                                                        : "#"
                                            }
                                            {...lightBoxHtml}
                                            target={
                                                disableLightBox &&
                                                    addCustomLink &&
                                                    source.openNewTab
                                                    ? "_blank"
                                                    : "_self"
                                            }
                                            className={`eb-gallery-img-content eb-filter-img-${filters}`}
                                            rel="noopener"
                                        >
                                            {innerHtml}
                                        </a>
                                    );
                                }
                            })}
                        </div>
                    </div>
                </div>
            );
        },
    },
    {
        attributes: omit({ ...attributes }, ["defaultFilter"]),
        supports: {
            align: ["wide", "full"],
        },
        save: ({ attributes }) => {
            const {
                blockId,
                layouts,
                sources,
                displayCaption,
                captionOnHover,
                styleNumber,
                overlayStyle,
                horizontalAlign,
                verticalAlign,
                disableLightBox,
                classHook,
                filterItems,
                enableFilter,
                enableFilterAll,
                filterAllTitle,
                addCustomLink,
            } = attributes;

            if (sources && sources.length === 0) return null;

            let lightBoxHtml = {
                id: "eb-gallery-img-content",
            };
            if (!disableLightBox) {
                lightBoxHtml = {
                    ...lightBoxHtml,
                    ["data-fslightbox"]: "gallery",
                    ["data-type"]: "image",
                };
            }

            return (
                <div {...useBlockProps.save()}>
                    <div
                        className={`eb-parent-wrapper eb-parent-${blockId} ${classHook}`}
                    >
                        {enableFilter && (
                            <ul
                                className={`eb-img-gallery-filter-wrapper filter-wrapper-${blockId}`}
                                data-id={blockId}
                            >
                                {enableFilterAll && (
                                    <li
                                        className="eb-img-gallery-filter-item"
                                        data-filter={"*"}
                                        data-id={blockId}
                                    >
                                        {filterAllTitle !== "" ? filterAllTitle : "All"}
                                    </li>
                                )}
                                {filterItems.map(({ value, label }, index) => {
                                    return (
                                        <li
                                            key={index}
                                            className="eb-img-gallery-filter-item"
                                            data-filter={`.eb-filter-img-${value}`}
                                            data-id={blockId}
                                        >
                                            {label}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                        <div
                            className={`eb-gallery-img-wrapper ${blockId} ${layouts} ${overlayStyle} caption-style-${styleNumber} ${captionOnHover ? "caption-on-hover" : ""
                                } ${enableFilter ? "eb-filterable-img-gallery" : ""}`}
                            data-id={blockId}
                        >
                            {sources && sources.map((source, index) => {
                                let filters;

                                if (
                                    source.hasOwnProperty("filter") &&
                                    source.filter.length > 0
                                ) {
                                    filters = JSON.parse(source.filter);

                                    filters = filters.map((filter) => filter.value);

                                    filters = filters.toString();

                                    filters = filters.replaceAll(
                                        ",",
                                        " eb-filter-img-"
                                    );
                                } else {
                                    filters = "";
                                }

                                let innerHtml = (
                                    <span className="eb-gallery-link-wrapper">
                                        <img
                                            className="eb-gallery-img"
                                            src={source.url}
                                            image-index={index}
                                            alt={source.alt}
                                        />
                                        {displayCaption &&
                                            source.caption &&
                                            source.caption.length > 0 && (
                                                <span
                                                    className={`eb-gallery-img-caption ${horizontalAlign} ${verticalAlign}`}
                                                >
                                                    {source.caption}
                                                </span>
                                            )}
                                    </span>
                                );

                                if (!addCustomLink) {
                                    return (
                                        <a
                                            key={index}
                                            href={
                                                !disableLightBox
                                                    ? source.url
                                                    : "javascript:void(0)"
                                            }
                                            {...lightBoxHtml}
                                            className={`eb-gallery-img-content eb-filter-img-${filters}`}
                                            rel="noopener"
                                        >
                                            {innerHtml}
                                        </a>
                                    );
                                }

                                if (addCustomLink) {
                                    return (
                                        <a
                                            key={index}
                                            href={
                                                !disableLightBox
                                                    ? source.url
                                                    : addCustomLink &&
                                                        source.customLink &&
                                                        source.isValidUrl
                                                        ? sanitizeURL(source.customLink)
                                                        : "#"
                                            }
                                            {...lightBoxHtml}
                                            target={
                                                disableLightBox &&
                                                    addCustomLink &&
                                                    source.openNewTab
                                                    ? "_blank"
                                                    : "_self"
                                            }
                                            className={`eb-gallery-img-content eb-filter-img-${filters}`}
                                            rel="noopener"
                                        >
                                            {innerHtml}
                                        </a>
                                    );
                                }
                            })}
                        </div>
                    </div>
                </div>
            );
        },
    },
    {
        attributes: omit({ ...attributes }, ["addCustomLink"]),
        supports: {
            align: ["wide", "full"],
        },
        save: ({ attributes }) => {
            const {
                blockId,
                layouts,
                sources,
                displayCaption,
                captionOnHover,
                styleNumber,
                overlayStyle,
                horizontalAlign,
                verticalAlign,
                disableLightBox,
                classHook,
                filterItems,
                enableFilter,
                enableFilterAll,
                filterAllTitle,
            } = attributes;

            if (sources.length === 0) return null;

            let lightBoxHtml = {
                id: "eb-gallery-img-content",
            };
            if (!disableLightBox) {
                lightBoxHtml = {
                    ...lightBoxHtml,
                    ["data-fslightbox"]: "gallery",
                    ["data-type"]: "image",
                };
            }

            return (
                <div {...useBlockProps.save()}>
                    <div
                        className={`eb-parent-wrapper eb-parent-${blockId} ${classHook}`}
                    >
                        {enableFilter && (
                            <ul
                                className={`eb-img-gallery-filter-wrapper filter-wrapper-${blockId}`}
                                data-id={blockId}
                            >
                                {enableFilterAll && (
                                    <li
                                        className="eb-img-gallery-filter-item"
                                        data-filter="*"
                                        data-id={blockId}
                                    >
                                        {filterAllTitle !== ""
                                            ? filterAllTitle
                                            : "All"}
                                    </li>
                                )}
                                {filterItems.map(({ value, label }, index) => {
                                    return (
                                        <li
                                            key={index}
                                            className="eb-img-gallery-filter-item"
                                            data-filter={`.eb-filter-img-${value}`}
                                            data-id={blockId}
                                        >
                                            {label}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                        <div
                            className={`eb-gallery-img-wrapper ${blockId} ${layouts} ${overlayStyle} caption-style-${styleNumber} ${captionOnHover ? "caption-on-hover" : ""
                                } ${enableFilter ? "eb-filterable-img-gallery" : ""
                                }`}
                            data-id={blockId}
                        >
                            {sources.map((source, index) => {
                                let filters;

                                if (
                                    source.hasOwnProperty("filter") &&
                                    source.filter.length > 0
                                ) {
                                    filters = JSON.parse(source.filter);

                                    filters = filters.map(
                                        (filter) => filter.value
                                    );

                                    filters = filters.toString();

                                    filters = filters.replaceAll(
                                        ",",
                                        " eb-filter-img-"
                                    );
                                } else {
                                    filters = "";
                                }
                                return (
                                    <a
                                        key={index}
                                        href={
                                            !disableLightBox ? source.url : "#"
                                        }
                                        {...lightBoxHtml}
                                        className={`eb-gallery-img-content eb-filter-img-${filters}`}
                                    >
                                        <span className="eb-gallery-link-wrapper">
                                            <img
                                                className="eb-gallery-img"
                                                src={source.url}
                                                image-index={index}
                                                alt={source.alt}
                                            />
                                            {displayCaption &&
                                                source.caption &&
                                                source.caption.length > 0 && (
                                                    <span
                                                        className={`eb-gallery-img-caption ${horizontalAlign} ${verticalAlign}`}
                                                    >
                                                        {source.caption}
                                                    </span>
                                                )}
                                        </span>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>
            );
        },
    },
    {
        attributes: { ...attributes },
        supports: {
            align: ["wide", "full"],
        },
        save: ({ attributes }) => {
            const {
                blockId,
                sliderType,
                sliderContentType,
                images,
                arrows,
                adaptiveHeight,
                autoplay,
                autoplaySpeed,
                dots,
                fade,
                infinite,
                vertical,
                pauseOnHover,
                speed,
                initialSlide,
                textAlign,
                classHook,
            } = attributes;

            //Slider Settings
            const settings = {
                arrows,
                adaptiveHeight,
                autoplay,
                autoplaySpeed,
                dots,
                fade,
                infinite,
                pauseOnHover,
                slidesToShow: attributes.slideToShowRange,
                speed,
                vertical,
                responsive: [
                    {
                        breakpoint: 1025,
                        settings: {
                            slidesToShow:
                                attributes.TABslideToShowRange ||
                                attributes.slideToShowRange,
                        },
                    },
                    {
                        breakpoint: 767,
                        settings: {
                            slidesToShow:
                                attributes.MOBslideToShowRange ||
                                attributes.slideToShowRange,
                        },
                    },
                ],
            };

            return (
                <div {...useBlockProps.save()}>
                    <div
                        className={`eb-parent-wrapper eb-parent-${blockId} ${classHook}`}
                    >
                        <div
                            className={`eb-slider-wrapper ${blockId}`}
                            data-settings={JSON.stringify(settings)}
                            data-images={JSON.stringify(images)}
                            data-sliderContentType={sliderContentType}
                            data-sliderType={sliderType}
                            data-textAlign={textAlign}
                        >
                            <div className={sliderType}>
                                {images.map((image, index) => (
                                    <div
                                        className={`eb-slider-item ${sliderContentType}`}
                                        key={index}
                                    >
                                        <img
                                            className="eb-slider-image"
                                            src={image.url}
                                        />
                                        {sliderType === "content" && (
                                            <div
                                                className={`eb-slider-content align-${textAlign}`}
                                            >
                                                {image.title &&
                                                    image.title.length > 0 && (
                                                        <RichText.Content
                                                            tagName={"h2"}
                                                            className="eb-slider-title"
                                                            value={image.title}
                                                        />
                                                    )}
                                                {image.subtitle &&
                                                    image.subtitle.length >
                                                    0 && (
                                                        <RichText.Content
                                                            tagName={"p"}
                                                            className="eb-slider-subtitle"
                                                            value={
                                                                image.subtitle
                                                            }
                                                        />
                                                    )}
                                                {image.showButton &&
                                                    image.buttonText &&
                                                    image.buttonText.length >
                                                    0 && (
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
                                                        >
                                                            <RichText.Content
                                                                value={
                                                                    image.buttonText
                                                                }
                                                            />
                                                        </a>
                                                    )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            );
        },
    },
    {
        attributes: omit({ ...attributes }, [
            "filterItems",
            "enableFilter",
            "enableFilterAll",
            "filterAllTitle",
        ]),
        supports: {
            align: ["wide", "full"],
        },
        save: ({ attributes }) => {
            const {
                blockId,
                layouts,
                sources,
                displayCaption,
                captionOnHover,
                styleNumber,
                overlayStyle,
                horizontalAlign,
                verticalAlign,
                disableLightBox,
                classHook,
            } = attributes;

            if (sources.length === 0) return null;

            let lightBoxHtml = {
                class: "eb-gallery-img-content",
            };
            if (!disableLightBox) {
                lightBoxHtml = {
                    ...lightBoxHtml,
                    ["data-fslightbox"]: "gallery",
                    ["data-type"]: "image",
                };
            }

            return (
                <div {...useBlockProps.save()}>
                    <div
                        className={`eb-parent-wrapper eb-parent-${blockId} ${classHook}`}
                    >
                        <div
                            className={`eb-gallery-img-wrapper ${blockId} ${layouts} ${overlayStyle} caption-style-${styleNumber} ${captionOnHover ? "caption-on-hover" : ""
                                }`}
                            data-id={blockId}
                        >
                            {sources.map((source, index) => (
                                <a
                                    key={index}
                                    href={
                                        !disableLightBox
                                            ? source.url
                                            : "javascript:void(0)"
                                    }
                                    {...lightBoxHtml}
                                >
                                    <span className="eb-gallery-link-wrapper">
                                        <img
                                            className="eb-gallery-img"
                                            src={source.url}
                                            image-index={index}
                                        />
                                        {displayCaption &&
                                            source.caption &&
                                            source.caption.length > 0 && (
                                                <span
                                                    className={`eb-gallery-img-caption ${horizontalAlign} ${verticalAlign}`}
                                                >
                                                    {source.caption}
                                                </span>
                                            )}
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            );
        },
    },
    {
        attributes: { ...attributes },
        supports: {
            align: ["wide", "full"],
        },
        save: ({ attributes }) => {
            const {
                blockId,
                layouts,
                sources,
                displayCaption,
                captionOnHover,
                styleNumber,
                overlayStyle,
                horizontalAlign,
                verticalAlign,
                disableLightBox,
                classHook,
            } = attributes;

            if (sources.length === 0) return null;

            return (
                <div {...useBlockProps.save()}>
                    <div
                        className={`eb-parent-wrapper eb-parent-${blockId} ${classHook}`}
                    >
                        <div
                            className={`eb-gallery-img-wrapper ${blockId} ${layouts} ${overlayStyle} caption-style-${styleNumber} ${captionOnHover ? "caption-on-hover" : ""
                                }`}
                            data-id={blockId}
                        >
                            {sources.map((source, index) => (
                                <a
                                    key={index}
                                    data-fslightbox="gallery"
                                    href={
                                        !disableLightBox
                                            ? source.url
                                            : "javascript:void(0)"
                                    }
                                    className={`eb-gallery-img-content`}
                                >
                                    <span className="eb-gallery-link-wrapper">
                                        <img
                                            className="eb-gallery-img"
                                            src={source.url}
                                            image-index={index}
                                        />
                                        {displayCaption &&
                                            source.caption &&
                                            source.caption.length > 0 && (
                                                <span
                                                    className={`eb-gallery-img-caption ${horizontalAlign} ${verticalAlign}`}
                                                >
                                                    {source.caption}
                                                </span>
                                            )}
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            );
        },
    },
    {
        attributes: { ...attributes },
        supports: {
            align: ["wide", "full"],
        },
        save: ({ attributes }) => {
            const {
                blockId,
                layouts,
                sources,
                displayCaption,
                captionOnHover,
                styleNumber,
                overlayStyle,
                horizontalAlign,
                verticalAlign,
                disableLightBox,
            } = attributes;

            if (sources.length === 0) return null;

            return (
                <div {...useBlockProps.save()}>
                    <div
                        className={`eb-gallery-img-wrapper ${blockId} ${layouts} ${overlayStyle} caption-style-${styleNumber} ${captionOnHover ? "caption-on-hover" : ""
                            }`}
                        data-id={blockId}
                    >
                        {sources.map((source, index) => (
                            <a
                                key={index}
                                data-fslightbox="gallery"
                                href={
                                    !disableLightBox
                                        ? source.url
                                        : "javascript:void(0)"
                                }
                                className={`eb-gallery-img-content`}
                            >
                                <span className="eb-gallery-link-wrapper">
                                    <img
                                        className="eb-gallery-img"
                                        src={source.url}
                                        image-index={index}
                                    />
                                    {displayCaption &&
                                        source.caption &&
                                        source.caption.length > 0 && (
                                            <span
                                                className={`eb-gallery-img-caption ${horizontalAlign} ${verticalAlign}`}
                                            >
                                                {source.caption}
                                            </span>
                                        )}
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            );
        },
    },
    {
        attributes: { ...attributes },

        save: ({ attributes }) => {
            const {
                blockId,
                layouts,
                sources,
                displayCaption,
                captionOnHover,
                styleNumber,
                overlayStyle,
                horizontalAlign,
                verticalAlign,
            } = attributes;

            if (sources.length === 0) return null;

            return (
                <div
                    className={`eb-gallery-img-wrapper ${blockId} ${layouts} ${overlayStyle} caption-style-${styleNumber} ${captionOnHover ? "caption-on-hover" : ""
                        }`}
                    data-id={blockId}
                >
                    {sources.map((source, index) => (
                        <a className={`eb-gallery-img-content`}>
                            <span className="eb-gallery-link-wrapper">
                                <img
                                    className="eb-gallery-img"
                                    src={source.url}
                                    image-index={index}
                                />
                                {displayCaption &&
                                    source.caption &&
                                    source.caption.length > 0 && (
                                        <span
                                            className={`eb-gallery-img-caption ${horizontalAlign} ${verticalAlign}`}
                                        >
                                            {source.caption}
                                        </span>
                                    )}
                            </span>
                        </a>
                    ))}
                </div>
            );
        },
    },
];

export default deprecated;
