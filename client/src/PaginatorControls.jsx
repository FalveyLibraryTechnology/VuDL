var React = require('react');
var MagicLabeler = require('./MagicLabeler');
var PaginatorControlGroup = require('./PaginatorControlGroup');
var ZoomToggleButton = require('./ZoomToggleButton');

class PaginatorControls extends React.Component{
    approveCurrentPageLabel = () => {
        this.setLabel(this.getLabel(true));
    }

    getLabel = (useMagic) => {
        if (typeof useMagic === 'undefined') {
            useMagic = true;
        }
        var label = this.refs.labelInput.value;
        return (label.length === 0 && useMagic)
            ? this.props.paginator.getLabel(this.props.paginator.state.currentPage)
            : label;
    }

    setLabel = (label) => {
        this.props.paginator.setLabel(this.props.paginator.state.currentPage, label);
    }

    setLabelPrefix = (str) => {
        this.setLabel(
            MagicLabeler.replaceLabelPart(this.getLabel(), 'prefix', str, true)
        );
    }

    setLabelBody = (str) => {
        this.setLabel(
            MagicLabeler.replaceLabelPart(this.getLabel(), 'label', str)
        );
    }

    setLabelSuffix = (str) => {
        this.setLabel(
            MagicLabeler.replaceLabelPart(this.getLabel(), 'suffix', str, true)
        );
    }

    toggleBrackets = () => {
        this.setLabel(MagicLabeler.toggleBrackets(this.getLabel()));
    }

    toggleCase = () => {
        this.setLabel(MagicLabeler.toggleCase(this.getLabel()));
    }

    toggleRoman = () => {
        var label = MagicLabeler.toggleRoman(this.getLabel());
        if (label === false) {
            return alert("Roman numeral toggle not supported for this label.");
        }
        this.setLabel(label);
    }

    updateCurrentPageLabel = () => {
        this.setLabel(this.getLabel(false));
    }

    render = () => {
        return (
            <div className="controls">
                <div className="group">
                    <div className="status"></div>
                    <input type="text" value={this.props.paginator.getLabel(this.props.paginator.state.currentPage, false)} ref="labelInput" id="page" onChange={this.updateCurrentPageLabel} />
                    <button onClick={this.props.paginator.prevPage}>Prev</button>
                    <button onClick={function() { this.approveCurrentPageLabel(); this.props.paginator.nextPage(); }.bind(this)}>Next</button>
                </div>
                <div className="top">
                    <ZoomToggleButton paginator={this.props.paginator} />
                    <button className="primary" onClick={function() { this.approveCurrentPageLabel(); this.props.paginator.save(false); }.bind(this)}>Save</button>
                    <button className="primary" onClick={function() { this.approveCurrentPageLabel(); this.props.paginator.save(true); }.bind(this)}>Save and Publish</button>
                </div>
                <PaginatorControlGroup callback={this.setLabelPrefix} label="prefixes">{MagicLabeler.prefixes}</PaginatorControlGroup>
                <PaginatorControlGroup callback={this.setLabelBody}   label="labels"  >{MagicLabeler.labels}</PaginatorControlGroup>
                <PaginatorControlGroup callback={this.setLabelSuffix} label="suffixes">{MagicLabeler.suffixes}</PaginatorControlGroup>
                <div className="toggles group">
                    <button onClick={this.toggleBrackets} title="Toggle Brackets">[ ]</button>
                    <button onClick={this.toggleCase} title="Toggle Case"><i className="fa fa-text-height"></i></button>
                    <button onClick={this.toggleRoman} title="Toggle Roman Numerals">4<i className="fa fa-fw fa-arrows-h"></i>IV</button>
                </div>
                <button onClick={this.props.paginator.autonumberFollowingPages} title="Autonumber Following Pages"><i className="fa fa-sort-numeric-asc"></i></button>
                <button className="danger" onClick={this.props.paginator.deletePage} title="Delete Current Page"><i className="fa fa-fw fa-trash"></i> Delete Current Page</button>
            </div>
        );
    }
};

module.exports = PaginatorControls;