import React from "react";
import { useStore } from "nanostores/react";

import { modal, closeModal } from "./interface-store.js";

function Modal() {
    let { open, title, content } = useStore(modal);

    if (!open || content === null) {
        return null;
    }

    return (
        <div id="modal" aria-hidden="true" className="is-open">
            <div className="modal-overlay" tabIndex="-1" data-modal-close>
                <div className="modal-container" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                    <header className="modal-header">
                        <h2 id="modal-title">{title}</h2>
                        <button className="modal-close" aria-label="Close modal" onClick={closeModal}>
                            <i className="ri-close-fill"></i>
                        </button>
                    </header>

                    <div id="modal-body">{content}</div>
                </div>
            </div>
        </div>
    );
}

export default Modal;
