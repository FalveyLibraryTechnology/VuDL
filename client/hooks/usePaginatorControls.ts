import { useState } from "react";
import MagicLabeler from "../util/MagicLabeler";

const usePaginatorControls = (currentPage, getMagicLabel, setLabel) => {
    const [labelInput, setLabelInput] = useState("");
    const getControlsLabel = (useMagic) => {
        if (typeof useMagic === "undefined") {
            useMagic = true;
        }
        return labelInput.length === 0 && useMagic ? getMagicLabel(currentPage) : labelInput;
    };

    const setControlsLabel = (label) => {
        setLabel(currentPage, label);
    };

    const approveCurrentPageLabel = () => {
        setControlsLabel(getControlsLabel(true));
    };

    const setLabelPrefix = (str) => {
        setControlsLabel(MagicLabeler.replaceLabelPart(getControlsLabel(), "prefix", str, true));
    };

    const setLabelBody = (str) => {
        setControlsLabel(MagicLabeler.replaceLabelPart(getControlsLabel(), "label", str));
    };

    const setLabelSuffix = (str) => {
        setControlsLabel(MagicLabeler.replaceLabelPart(getControlsLabel(), "suffix", str, true));
    };

    const toggleBrackets = () => {
        setControlsLabel(MagicLabeler.toggleBrackets(getControlsLabel()));
    };

    const toggleCase = () => {
        setControlsLabel(MagicLabeler.toggleCase(getControlsLabel()));
    };

    const toggleRoman = () => {
        var label = MagicLabeler.toggleRoman(getControlsLabel());
        if (label === false) {
            return alert("Roman numeral toggle not supported for this label.");
        }
        setControlsLabel(label);
    };

    const updateCurrentPageLabel = (event) => {
        setLabelInput(event.target.value);
        setControlsLabel(event.target.value);
    };

    return {
        action: {
            setLabelPrefix,
            setLabelBody,
            setLabelSuffix,
            toggleBrackets,
            toggleCase,
            toggleRoman,
            updateCurrentPageLabel,
            approveCurrentPageLabel,
        },
    };
};

export default usePaginatorControls;
