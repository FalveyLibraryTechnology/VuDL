import $ from 'jquery';

var React = require('react');

class JobPaginator extends React.Component{
    constructor(props) {
        super(props);
        this.magicLabelCache = [];
        this.state = {active: false, currentPage: 0, zoom: false, order: []};
    }

    getImageUrl = (imageNumber, size) => {
        if (typeof this.state.order[imageNumber] === 'undefined') {
            return false;
        }
        this.filename = this.state.order[imageNumber].filename;
        return this.props.app.getImageUrl(this.state.category, this.state.job, this.filename, size);
    }

    getStatusUrl = () => {
        return this.props.app.getJobUrl(this.state.category, this.state.job, '/status');
    }

    getLabel = (imageNumber, useMagic) => {
        useMagic = (typeof useMagic === 'undefined') ? true : useMagic;
        var label = (typeof this.state.order[imageNumber] === 'undefined')
            ? null : this.state.order[imageNumber]['label'];
        if (useMagic && null === label) {
            if (typeof this.magicLabelCache[imageNumber] === 'undefined') {
                this.magicLabelCache[imageNumber] = this.MagicLabeler.getLabel(imageNumber, this.getLabel);
            }
            return this.magicLabelCache[imageNumber];
        }
        return label;
    }

    setLabel = (imageNumber, text) => {
        this.magicLabelCache = [];  // clear label cache whenever there is a change
        var newState = this.state;
        if (text !== null && text.length === 0) {
            text = null;
        }
        if (typeof newState.order[imageNumber] === "undefined") {
            return;
        }
        newState.order[imageNumber]['label'] = text;
        this.setState(newState);
        dispatchEvent(new Event('Prep.editted'));
    }

    autonumberFollowingPages = () => {
        var pages = this.state.order.length - (this.state.currentPage + 1);
        var affected = pages - this.countMagicLabels(this.state.currentPage + 1);
        if (affected > 0) {
            var msg = "You will be clearing " + affected + " label(s). Are you sure?";
            if (!window.confirm(msg)) {
                return;
            }
        }
        for (var i = this.state.currentPage + 1; i < this.state.order.length; i++) {
            this.setLabel(i, null);
        }
    }

    countMagicLabels = (startAt) => {
        var count = 0;
        for (var i = startAt; i < this.state.order.length; i++) {
            if (null === this.getLabel(i, false)) {
                count++;
            }
        }
        return count;
    }

    deletePage = () => {
        if (this.state.order.length < 2) {
            alert('You cannot delete the last page in a job.');
            return;
        }
        if (!window.confirm("Are you sure you wish to delete the current page?")) {
            return;
        }
        var imageUrl = this.getImageUrl(this.state.currentPage, '*');
        var parts = imageUrl.split("/");
        var imageFilename = parts[parts.length - 2];
        this.props.app.ajax({
            type: 'DELETE',
            url: imageUrl,
            success: function() {
              this.removePages([imageFilename]);
              if (this.state.currentPage >= this.state.order.length) {
                  this.setPage(this.state.currentPage - 1);
              }
              alert('Page deleted!');
            }.bind(this),
            error: function() { alert('Unable to delete!'); }
        });
    }

    loadJob = (category, job) => {
        var promise = new Promise(function(resolve, reject) {
            this.props.app.getJSON(this.props.app.getJobUrl(category, job, ''), null, function (data, status) {
                resolve(data);
            });
        }.bind(this));
        promise.then(function(data) {
            data.category = category;
            data.job = job;
            data.active = false;
            data.currentPage = 0;
            this.setState(data);
            return new Promise(function(resolve, reject) {
                this.props.app.getJSON(this.getStatusUrl(), null, function (data) {
                    resolve(data);
                });
            }.bind(this));
        }.bind(this)).then(function(status) {
            if (status.file_problems.deleted.length > 0
                || status.file_problems.added.length > 0
            ) {
                var msg = '';
                if (status.file_problems.deleted.length > 0) {
                    msg += status.file_problems.deleted.length
                        + " file(s) have been removed from the job since the last edit.\n"
                    this.removePages(status.file_problems.deleted);
                }
                if (status.file_problems.added.length > 0) {
                    msg += status.file_problems.added.length
                        + " file(s) have been added to the job since the last edit.\n"
                    this.addPages(status.file_problems.added);
                }
                alert(msg);
            }
            var newState = this.state;
            newState.active = true;
            this.setState(newState);
            dispatchEvent(new Event('Prep.loaded'));
        }.bind(this));
    }

    findNewPagePosition = (page, list) => {
        for (var i = 0; i < list.length; i++) {
            if (list[i].filename >= page) {
                return i;
            }
        }
        return i;
    }

    addPages = (pages) => {
        var newState = this.state;
        for (var i = 0; i < pages.length; i++) {
            newState.order.splice(
                this.findNewPagePosition(pages[i], newState.order),
                0,
                {filename: pages[i], label: null}
            );
        }
        this.setState(newState);
    }

    removePages = (pages) => {
        var newOrder = [];
        for (var i = 0; i < this.state.order.length; i++) {
            var include = true;
            for (var j = 0; j < pages.length; j++) {
                if (this.state.order[i].filename === pages[j]) {
                    include = false;
                    break;
                }
            }
            if (include) {
                newOrder[newOrder.length] = this.state.order[i];
            }
        }
        var newState = this.state;
        newState.order = newOrder;
        this.setState(newState);
    }

    setPage = (p) => {
        if (p >= 0 && p < this.state.order.length) {
            var newState = this.state;
            newState.currentPage = p;
            this.setState(newState);
        }
    }

    nextPage = () => {
        this.setPage(this.state.currentPage + 1);
    }

    prevPage = () => {
        this.setPage(this.state.currentPage - 1);
    }

    saveMagicLabels = () => {
        for (var i = 0; i < this.state.order.length; i++) {
            if (null === this.getLabel(i, false)) {
                this.setLabel(i, this.getLabel(i));
            }
        }
    }

    confirmSavedMagicLabels = (count) => {
        var msg = "You will be saving " + count + " unreviewed, auto-generated"
            + " label(s). Are you sure?";
        return window.confirm(msg);
    }

    save = (publish) => {
        var count = this.countMagicLabels(0);
        if (count > 0 && !this.confirmSavedMagicLabels(count)) {
            return;
        }
        this.saveMagicLabels();
        var promise = new Promise(function(resolve, reject) {
            // If the user wants to publish, let's make sure all derivatives are
            // ready! Otherwise we can resolve with no further actions.
            if (publish) {
                this.props.app.getJSON(this.getStatusUrl(), null, function (data) {
                    resolve(data);
                });
            } else {
                resolve(null);
            }
        }.bind(this));
        promise.then(function(data) {
            if (publish) {
                var msg;
                if (data.derivatives.expected > data.derivatives.processed) {
                    msg = "Derivative images have not been generated yet. Please"
                        + " go back to the main menu and hit the \"build\" button"
                        + " for this job before publishing it.";
                    alert(msg);
                    return;
                }
                msg = "Are you sure you wish to publish this job? You will not be able"
                    + " to make any further edits."
                if (!window.confirm(msg)) {
                    return;
                }
            }
            this.props.app.ajax({
                type: 'PUT',
                url: this.props.app.getJobUrl(this.state.category, this.state.job, ''),
                contentType: 'application/json',
                data: JSON.stringify({ order: this.state.order, published: publish }),
                success: function() {
                  alert('Success!');
                  this.props.app.activateJobSelector();
                  dispatchEvent(new Event('Prep.saved'));
                }.bind(this),
                error: function() { alert('Unable to save!'); }
            });
        }.bind(this));
    }

    toggleZoom = () => {
        this.newState = this.state;
        this.newState.zoom = !this.newState.zoom;
        this.setState(this.newState);
    }

    render = () => {
        var preview = this.state.zoom
            ? <PaginatorZoomy img={this.getImageUrl(this.state.currentPage, 'large')} />
            : <PaginatorPreview img={this.getImageUrl(this.state.currentPage, 'medium')} />
        return (
            <div className={this.state.active ? '' : 'hidden'} id="paginator">
                <div className="row">
                    <div className="six col">{preview}</div>
                    <div className="six col">
                        <p>{this.state.category} &gt; {this.state.job}</p>
                        <PaginatorControls paginator={this} />
                        <PaginatorList paginator={this} pageCount={this.state.order.length} />
                    </div>
                </div>
            </div>
        );
    }
};

class PaginatorPreview extends React.Component{
    render = () => {
        var img = this.props.img
            ? <img src={this.props.img} alt="" />
            : '';
        return (
            <div className="preview">
                {img}
            </div>
        );
    }
};

class PaginatorZoomy extends React.Component{
    componentDidMount = () => {
        this.Zoomy.init(document.getElementById('zoomy'));
        this.componentDidUpdate();
    }

    componentDidUpdate = () => {
        this.Zoomy.load(
            this.props.img,
            function() {
                this.Zoomy.resize();
                this.Zoomy.center();
                $(this.refs.status).hide();
            }.bind(this)
        );
    }

    render = () => {
        return (
            <div>
                <div ref="status" id="zoomyStatus">Loading...</div>
                <canvas id="zoomy"></canvas>
            </div>
        );
    }
};

class PaginatorControls extends React.Component{
    approveCurrentPageLabel = () => {
        this.setLabel(this.getLabel(true));
    }

    getLabel = (useMagic) => {
        if (typeof useMagic === 'undefined') {
            useMagic = true;
        }
        var label = $(this.refs.labelInput).val();
        return (label.length === 0 && useMagic)
            ? this.props.paginator.getLabel(this.props.paginator.state.currentPage)
            : label;
    }

    setLabel = (label) => {
        this.props.paginator.setLabel(this.props.paginator.state.currentPage, label);
    }

    setLabelPrefix = (str) => {
        this.setLabel(
            this.MagicLabeler.replaceLabelPart(this.getLabel(), 'prefix', str, true)
        );
    }

    setLabelBody = (str) => {
        this.setLabel(
            this.MagicLabeler.replaceLabelPart(this.getLabel(), 'label', str)
        );
    }

    setLabelSuffix = (str) => {
        this.setLabel(
            this.MagicLabeler.replaceLabelPart(this.getLabel(), 'suffix', str, true)
        );
    }

    toggleBrackets = () => {
        this.setLabel(this.MagicLabeler.toggleBrackets(this.getLabel()));
    }

    toggleCase = () => {
        this.setLabel(this.MagicLabeler.toggleCase(this.getLabel()));
    }

    toggleRoman = () => {
        var label = this.MagicLabeler.toggleRoman(this.getLabel());
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
                <PaginatorControlGroup callback={this.setLabelPrefix} label="prefixes">{this.MagicLabeler.prefixes}</PaginatorControlGroup>
                <PaginatorControlGroup callback={this.setLabelBody}   label="labels"  >{this.MagicLabeler.labels}</PaginatorControlGroup>
                <PaginatorControlGroup callback={this.setLabelSuffix} label="suffixes">{this.MagicLabeler.suffixes}</PaginatorControlGroup>
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

class PaginatorControlGroup extends React.Component{
    render = () => {
        var buttons = this.props.children.map(function (item) {
            var callback = function() {
                this.props.callback(item);
            }.bind(this);
            return (
                <button onClick={callback} key={item}>{item}</button>
            );
        }.bind(this));
        return (
            <div className="group" id={this.props.label}>{buttons}</div>
        );
    }
};

class PaginatorList extends React.Component{
    scrollTo = (thumb) => {
        var listOffset =
            this.refs.pageList.offsetTop +
            (this.refs.thumb0.refs.wrapper.offsetTop - this.refs.pageList.offsetTop);
        this.refs.pageList.scrollTop = thumb.offsetTop - listOffset;
    }

    render = () => {
        var pages = [];
        for (var i = 0; i < this.props.pageCount; i++) {
            pages[i] = <Thumbnail ref={"thumb" + i} list={this} selected={i === this.props.paginator.state.currentPage} paginator={this.props.paginator} key={i} number={i} />;
        };
        return (
            <div ref="pageList" className="pageList">{pages}</div>
        );
    }
};

class Thumbnail extends React.Component{
    selectPage = () => {
        this.props.paginator.setPage(this.props.number);
    }

    componentDidUpdate = () => {
        if (this.props.selected) {
            this.props.list.scrollTo(this.refs.wrapper);
        }
    }

    render = () => {
        var label = this.props.paginator.getLabel(this.props.number);
        // check for magic labels:
        var labelClass = 'label' +
            (null === this.props.paginator.getLabel(this.props.number, false) ? ' magic' : '');
        var myClass = 'thumbnail' + (this.props.selected ? ' selected' : '');
        return (
            <div onClick={this.selectPage} className={myClass} ref="wrapper">
              <div className="ratio">
                <div className="content">
                  <span className="img-helper"></span>
                  <img alt="" src={this.props.paginator.getImageUrl(this.props.number, 'thumb')} />
                </div>
              </div>
              <div className="number">{this.props.number + 1}</div>
              <div className={labelClass}>{label}</div>
            </div>
        );
    }
};

class ZoomToggleButton extends React.Component{
    render = () => {
        return (
            <button onClick={this.props.paginator.toggleZoom}>{this.props.paginator.state.zoom ? 'Turn Zoom Off' : 'Turn Zoom On'}</button>
        );
    }
};

export default JobPaginator;