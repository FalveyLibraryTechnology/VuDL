import { useState } from "react";
import MagicLabeler from "../util/MagicLabeler";

const usePaginatorControls = (currentPage: number, getMagicLabel: (page: number) => string, setLabel: (page: number, label: string) => void) => {
    const [labelInput, setLabelInput] = useState("");
    const getControlsLabel = (): string => {
        return labelInput.length === 0 ? getMagicLabel(currentPage) : labelInput;
    };

    const setControlsLabel = (label: string): void => {
        setLabel(currentPage, label);
        // After saving the label, clear the input so we defer to the magic labeler;
        // otherwise, the system can get into a confused state (where, for example,
        // toggling brackets after entering a number by hand will not work).
        setLabelInput("");
    };

    const approveCurrentPageLabel = (): void => {
        setControlsLabel(getControlsLabel());
    };

    const setLabelPrefix = (str: string): void => {
        setControlsLabel(MagicLabeler.replaceLabelPart(getControlsLabel(), "prefix", str, true));
    };

    const setLabelBody = (str: string): void => {
        setControlsLabel(MagicLabeler.replaceLabelPart(getControlsLabel(), "label", str));
    };

    const setLabelSuffix = (str: string): void => {
        setControlsLabel(MagicLabeler.replaceLabelPart(getControlsLabel(), "suffix", str, true));
    };

    const toggleBrackets = (): void => {
        setControlsLabel(MagicLabeler.toggleBrackets(getControlsLabel()));
    };

    const toggleCase = (): void => {
        setControlsLabel(MagicLabeler.toggleCase(getControlsLabel()));
    };

    const toggleRoman = (): void => {
        var label = MagicLabeler.toggleRoman(getControlsLabel());
        if (label === false) {
            return alert("Roman numeral toggle not supported for this label.");
        }
        setControlsLabel(label);
    };

    const updateCurrentPageLabel = (event): void => {
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
