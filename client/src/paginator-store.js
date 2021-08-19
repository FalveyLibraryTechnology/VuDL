import { createMap, getValue, updateKey } from "nanostores";

import AjaxHelper from "./AjaxHelper";
import MagicLabeler from "./MagicLabeler";
const ajax = AjaxHelper.getInstance();
let pageClamp = makeClamp(0, 0);

function makeClamp(min, max) {
    return function clamp(val) {
        if (val < min) return min;
        if (val > max) return max;
        return val;
    };
}

export const paginatorStore = createMap(() => {
    paginatorStore.set({
        active: false,
        currentPage: 0,
        magicLabelCache: {},
        order: [],
        zoom: false,
    });

    subscribeKey("order", (store) => {
        pageClamp = makeClamp(0, store.order.length);
    });
});

export function subscribeKey(key, func) {
    paginatorStore.subscribe((store, changed) => {
        if (changed == key) {
            func(store);
        }
    });
}

export function initPaginatorStore(data) {
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            paginatorStore.setKey(key, data[key]);
        }
    }
}

export function getImageUrl(imageNumber, size) {
    const { category, job, order } = getValue(paginatorStore);
    if (typeof order[imageNumber] === "undefined") {
        return false;
    }
    return ajax.getImageUrl(category, job, order[imageNumber].filename, size);
}

export function getStatusUrl() {
    const { category, job } = getValue(paginatorStore);
    return ajax.getJobUrl(category, job, "/status");
}

export function getLabel(imageNumber, useMagic = true) {
    const { magicLabelCache, order } = getValue(paginatorStore);
    var label = typeof order[imageNumber] === "undefined" ? null : order[imageNumber]["label"];
    if (useMagic && null === label) {
        if (typeof magicLabelCache[imageNumber] === "undefined") {
            magicLabelCache[imageNumber] = MagicLabeler.getLabel(imageNumber, getLabel);
            paginatorStore.setKey("magicLabelCache", magicLabelCache);
        }
        return magicLabelCache[imageNumber];
    }
    // Always return a string, even if the internal value is null:
    return label;
}

export function setLabel(imageNumber, text) {
    paginatorStore.setKey("magicLabelCache", []); // clear label cache whenever there is a change
    const { order } = getValue(paginatorStore);
    if (text !== null && text.length === 0) {
        text = null;
    }
    if (typeof order[imageNumber] === "undefined") {
        return;
    }
    order[imageNumber]["label"] = text;
    paginatorStore.setKey("order", order);
    // TODO: If this is used, switch to nanostores
    dispatchEvent(new Event("Prep.editted"));
}

export function setPage(newPage) {
    updateKey(paginatorStore, "currentPage", () => pageClamp(newPage));
}

export function nextPage() {
    updateKey(paginatorStore, "currentPage", (page) => pageClamp(page + 1));
}

export function prevPage() {
    updateKey(paginatorStore, "currentPage", (page) => pageClamp(page - 1));
}

export function toggleZoom() {
    updateKey(paginatorStore, "zoom", (zoom) => !zoom);
}
