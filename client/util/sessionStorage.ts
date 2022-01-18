import { useState, useEffect } from "react";

const getSessionStorage = (storageKey, initialStorageValue) => {
    if (typeof window.sessionStorage === "undefined" || !window.sessionStorage.getItem(storageKey)) {
        return initialStorageValue;
    }
    return JSON.parse(window.sessionStorage.getItem(storageKey));
};

const useSessionStorage = (storageKey, initialStorageValue) => {
    const [storageValue, setStorageValue] = useState(getSessionStorage(storageKey, initialStorageValue));

    useEffect(() => {
        if (typeof window.sessionStorage !== "undefined") {
            sessionStorage.setItem(storageKey, JSON.stringify(storageValue));
        }
    }, [storageKey, storageValue]);

    return [storageValue, setStorageValue];
};

export { getSessionStorage, useSessionStorage };
