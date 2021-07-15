import React from "react";
import PropTypes from "prop-types";

import FieldList from "./FieldList";

class MetadataEditor extends React.Component {
    static propTypes = {
        pid: PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.state = {
            fieldLists: [
                { title: "Title", type: "String", values: ["one", "two"] },
                { title: "Creator", type: "String", values: ["just Chris"] },
            ],
        };
        this.options = [
            { title: "Title", type: "String" },
            { title: "Creator", type: "String" },
            { title: "Subject", type: "String" },
            { title: "Description", type: "String" },
            { title: "Publisher", type: "String" },
            { title: "Contributor", type: "String" },
            { title: "Date", type: "String" },
            { title: "Type", type: "String" },
            { title: "Format", type: "String" },
            { title: "Identifier", type: "String" },
            { title: "Source", type: "String" },
            { title: "Language", type: "String" },
            { title: "Relation", type: "String" },
            { title: "Coverage", type: "String" },
            { title: "Rights", type: "String" },
        ];

        this.addField = this.addField.bind(this);
    }

    addField(newOption) {
        console.log(newOption);
        let newList = this.state.fieldLists.slice();
        for (let i = 0; i < newList.length; i++) {
            if (newList[i].title == newOption.title) {
                newList[i].values.push("= NEW =");
                this.setState({ fieldLists: newList });
                return;
            }
        }
        newList.push({ title: newOption.title, type: newOption.type, values: ["= NEW ="] });
        this.setState({ fieldLists: newList });
    }

    render() {
        return (
            <div className="editor metadata-editor">
                <nav>
                    <button className="metadata__preview btn--big">Preview</button>
                    <button className="metadata__preview btn--big">Clone metadata</button>
                </nav>

                <div className="flex">
                    <div className="flex-1 metadata__fieldLists">
                        {this.state.fieldLists.map((fieldList) => (
                            <FieldList key={fieldList.title} {...fieldList} />
                        ))}
                    </div>
                    <ul className="flex-none metadata__options">
                        {this.options.map((option) => (
                            <li key={option.title}>
                                <button type={option.type} onClick={() => this.addField(option)}>
                                    {option.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }
}

export default MetadataEditor;
