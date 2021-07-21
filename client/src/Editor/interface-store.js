import { createMap, getValue } from "nanostores";

export const modal = createMap(() => {
    modal.set({
        content: [], // TODO: Make an array for a stack of modals???
        titles: [],
    });
});

export function openModal(newContent, newTitle = "") {
    let { content, titles } = getValue(modal);
    modal.setKey("content", [newContent, ...content]);
    modal.setKey("titles", [newTitle, ...titles]);
}

export function closeModal() {
    let { content, titles } = getValue(modal);
    modal.setKey("content", content.slice(1));
    modal.setKey("titles", titles.slice(1));
}
