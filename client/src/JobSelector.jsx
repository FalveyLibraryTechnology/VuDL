const React = require("react");
const PropTypes = require("prop-types");

const Category = require("./Category");
const { VuDLPrep } = require("./VuDLPrep");

class JobSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = { active: true, data: [] };
    }

    hide() {
        var newState = this.state;
        newState.active = false;
        this.setState(newState);
    }

    show() {
        this.setState({ active: true, data: [] });
        this.componentDidMount();
    }

    componentDidMount() {
        this.props.app.getJSON(
            this.props.url,
            null,
            function (data) {
                this.setState({ active: true, data: data });
            }.bind(this)
        );
    }

    render() {
        var categories = [];
        var empty_categories = [];
        for (var i in this.state.data) {
            var category = this.state.data[i];
            var element = <Category app={this.props.app} key={category.category} data={category} />;
            if (category.jobs.length > 0) {
                categories[categories.length] = element;
            } else {
                empty_categories[empty_categories.length] = element;
            }
        }
        return (
            <div className={this.state.active ? "" : "hidden"} id="jobSelector">
                {categories}
                {empty_categories}
            </div>
        );
    }
}

JobSelector.propTypes = {
    app: PropTypes.shape({ type: PropTypes.oneOf([VuDLPrep]) }),
    url: PropTypes.string,
};

module.exports = JobSelector;
