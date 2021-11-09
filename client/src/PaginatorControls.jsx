import React from "react";
import PropTypes from "prop-types";

import MagicLabeler from "./MagicLabeler";
import PaginatorControlGroup from "./PaginatorControlGroup";
import ZoomToggleButton from "./ZoomToggleButton";

class PaginatorControls extends React.Component {
    constructor(props) {
        super(props);
        // BIND
        // This is not a problem for ES7+
        // getLabel = (useMagic) => {
        // TODO: Make compiler happy
        this.getLabel = this.getLabel.bind(this);
        this.setLabel = this.setLabel.bind(this);
        this.setLabelPrefix = this.setLabelPrefix.bind(this);
        this.setLabelBody = this.setLabelBody.bind(this);
        this.setLabelSuffix = this.setLabelSuffix.bind(this);
        this.toggleBrackets = this.toggleBrackets.bind(this);
        this.toggleCase = this.toggleCase.bind(this);
        this.toggleRoman = this.toggleRoman.bind(this);
        this.updateCurrentPageLabel = this.updateCurrentPageLabel.bind(this);
    }

    approveCurrentPageLabel() {
        this.setLabel(this.getLabel(true));
    }

    getLabel(useMagic) {
        if (typeof useMagic === "undefined") {
            useMagic = true;
        }
        var label = this.labelInput.value;
        return label.length === 0 && useMagic ? this.props.getMagicLabel(this.props.currentPage) : label;
    }

    setLabel(label) {
        this.props.setLabel(this.props.currentPage, label);
    }

    setLabelPrefix(str) {
        this.setLabel(MagicLabeler.replaceLabelPart(this.getLabel(), "prefix", str, true));
    }

    setLabelBody(str) {
        this.setLabel(MagicLabeler.replaceLabelPart(this.getLabel(), "label", str));
    }

    setLabelSuffix(str) {
        this.setLabel(MagicLabeler.replaceLabelPart(this.getLabel(), "suffix", str, true));
    }

    toggleBrackets() {
        this.setLabel(MagicLabeler.toggleBrackets(this.getLabel()));
    }

    toggleCase() {
        this.setLabel(MagicLabeler.toggleCase(this.getLabel()));
    }

    toggleRoman() {
        var label = MagicLabeler.toggleRoman(this.getLabel());
        if (label === false) {
            return alert("Roman numeral toggle not supported for this label.");
        }
        this.setLabel(label);
    }

    updateCurrentPageLabel() {
        this.setLabel(this.getLabel(false));
    }

    render() {
        return this.props.pageCount > 0 ? (
            <div className="controls">
                <div className="group">
                    <div className="status"></div>
                    <input
                        type="text"
                        value={this.props.getLabel(this.props.currentPage) ?? ""}
                        ref={(l) => {
                            this.labelInput = l;
                        }}
                        id="page"
                        onChange={this.updateCurrentPageLabel}
                    />
                    <button onClick={this.props.prevPage}>Prev</button>
                    <button
                        onClick={function () {
                            this.approveCurrentPageLabel();
                            this.props.nextPage();
                        }.bind(this)}
                    >
                        Next
                    </button>
                </div>
                <div className="top">
                    <ZoomToggleButton toggleZoom={this.props.toggleZoom} zoom={this.props.zoom} />
                    <button
                        className="primary"
                        onClick={function () {
                            this.approveCurrentPageLabel();
                            this.props.save(false);
                        }.bind(this)}
                    >
                        Save
                    </button>
                    <button
                        className="primary"
                        onClick={function () {
                            this.approveCurrentPageLabel();
                            this.props.save(true);
                        }.bind(this)}
                    >
                        Save and Publish
                    </button>
                </div>
                <PaginatorControlGroup callback={this.setLabelPrefix} label="prefixes">
                    {MagicLabeler.prefixes}
                </PaginatorControlGroup>
                <PaginatorControlGroup callback={this.setLabelBody} label="labels">
                    {MagicLabeler.labels}
                </PaginatorControlGroup>
                <PaginatorControlGroup callback={this.setLabelSuffix} label="suffixes">
                    {MagicLabeler.suffixes}
                </PaginatorControlGroup>
                <div className="toggles group">
                    <button onClick={this.toggleBrackets} title="Toggle Brackets">
                        [ ]
                    </button>
                    <button onClick={this.toggleCase} title="Toggle Case">
                        <i className="fa fa-text-height"></i>
                    </button>
                    <button onClick={this.toggleRoman} title="Toggle Roman Numerals">
                        4<i className="fa fa-fw fa-arrows-alt-h"></i>IV
                    </button>
                </div>
                <button onClick={this.props.autonumberFollowingPages} title="Autonumber Following Pages">
                    <i className="fa fa-sort-numeric-down"></i>
                </button>
                <button className="danger" onClick={this.props.deletePage} title="Delete Current Page">
                    <i className="fa fa-fw fa-trash"></i> Delete Current Page
                </button>
            </div>
        ) : (
            // No pages, only show save buttons:
            <>
                <button
                    className="primary"
                    onClick={function () {
                        this.props.save(false);
                    }.bind(this)}
                >
                    Save
                </button>
                <button
                    className="primary"
                    onClick={function () {
                        this.props.save(true);
                    }.bind(this)}
                >
                    Save and Publish
                </button>
            </>
        );
    }
}

PaginatorControls.propTypes = {
    autonumberFollowingPages: PropTypes.func,
    deletePage: PropTypes.func,
    getLabel: PropTypes.func,
    getMagicLabel: PropTypes.func,
    nextPage: PropTypes.func,
    prevPage: PropTypes.func,
    save: PropTypes.func,
    setLabel: PropTypes.func,
    toggleZoom: PropTypes.func,
    zoom: PropTypes.bool,
    currentPage: PropTypes.number,
    pageCount: PropTypes.number,
};

export default PaginatorControls;
