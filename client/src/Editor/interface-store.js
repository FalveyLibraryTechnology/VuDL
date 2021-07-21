import { createMap } from "nanostores";

export const modal = createMap(() => {
    modal.set({
        open: false,
        content: null,
        title: "",
    });
});

export function openModal(content, title = "") {
    modal.setKey("open", true);
    modal.setKey("content", content);
    modal.setKey("title", title);
}

export function closeModal() {
    modal.setKey("open", false);
}
