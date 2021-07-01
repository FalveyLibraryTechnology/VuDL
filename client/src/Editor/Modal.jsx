import React from "react";
import PropTypes from "prop-types";

class Modal extends React.Component {
    static propTypes = {
        title: PropTypes.string,
        children: PropTypes.any,
    };

    render() {
        return (
            <div id="modal" aria-hidden="true">
                <div className="modal-overlay" tabIndex="-1" data-modal-close>
                    <div className="modal-container" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                        <header className="modal-header">
                            <h2 id="modal-title">{this.props.title}</h2>
                            <button className="modal-close" aria-label="Close modal" data-modal-close>
                                <i className="ri-close-fill"></i>
                            </button>
                        </header>

                        <div id="modal-body">{this.props.children}</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Modal;
