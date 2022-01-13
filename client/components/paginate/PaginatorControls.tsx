import React from "react";

import { usePaginatorContext } from "../../context/PaginatorContext";
import usePaginatorControls from "../../hooks/usePaginatorControls";
import MagicLabeler from "../../util/MagicLabeler";
import PaginatorControlGroup from "./PaginatorControlGroup";
import ZoomToggleButton from "./ZoomToggleButton";

const PaginatorControls = () => {
    const {
        state: { currentPage, zoom, order },
        action: {
            autonumberFollowingPages,
            getLabel,
            getMagicLabel,
            setLabel,
            prevPage,
            nextPage,
            deletePage,
            save,
            toggleZoom,
        },
    } = usePaginatorContext();
    const pageCount = order.length;
    const {
        action: {
            updateCurrentPageLabel,
            approveCurrentPageLabel,
            setLabelPrefix,
            setLabelBody,
            setLabelSuffix,
            toggleBrackets,
            toggleCase,
            toggleRoman,
        },
    } = usePaginatorControls(currentPage, getMagicLabel, setLabel);
    return pageCount > 0 ? (
        <div className="controls">
            <div className="group">
                <div className="status"></div>
                <input type="text" value={getLabel(currentPage) ?? ""} id="page" onChange={updateCurrentPageLabel} />
                <button onClick={prevPage}>Prev</button>
                <button
                    onClick={() => {
                        approveCurrentPageLabel();
                        nextPage();
                    }}
                >
                    Next
                </button>
            </div>
            <div className="top">
                <ZoomToggleButton toggleZoom={toggleZoom} zoom={zoom} />
                <button
                    className="primary"
                    onClick={() => {
                        approveCurrentPageLabel();
                        save(false);
                    }}
                >
                    Save
                </button>
                <button
                    className="primary"
                    onClick={() => {
                        approveCurrentPageLabel();
                        save(true);
                    }}
                >
                    Save and Publish
                </button>
            </div>
            <PaginatorControlGroup callback={setLabelPrefix} label="prefixes">
                {MagicLabeler.prefixes}
            </PaginatorControlGroup>
            <PaginatorControlGroup callback={setLabelBody} label="labels">
                {MagicLabeler.labels}
            </PaginatorControlGroup>
            <PaginatorControlGroup callback={setLabelSuffix} label="suffixes">
                {MagicLabeler.suffixes}
            </PaginatorControlGroup>
            <div className="toggles group">
                <button onClick={toggleBrackets} title="Toggle Brackets">
                    [ ]
                </button>
                <button onClick={toggleCase} title="Toggle Case">
                    <i className="fa fa-text-height"></i>
                </button>
                <button onClick={toggleRoman} title="Toggle Roman Numerals">
                    4<i className="fa fa-fw fa-arrows-alt-h"></i>IV
                </button>
            </div>
            <button onClick={autonumberFollowingPages} title="Autonumber Following Pages">
                <i className="fa fa-sort-numeric-down"></i>
            </button>
            <button className="danger" onClick={deletePage} title="Delete Current Page">
                <i className="fa fa-fw fa-trash"></i> Delete Current Page
            </button>
        </div>
    ) : (
        // No pages, only show save buttons:
        <>
            <button className="primary" onClick={() => save(false)}>
                Save
            </button>
            <button className="primary" onClick={() => save(true)}>
                Save and Publish
            </button>
        </>
    );
};

export default PaginatorControls;
