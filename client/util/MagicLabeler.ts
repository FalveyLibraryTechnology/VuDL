import RomanNumerals from "roman-numerals";

var MagicLabeler = {
    prefixes: ["Front ", "Inside front ", "Rear ", "Inside rear "],
    labels: ["Blank", "cover", "fly leaf", "pastedown", "Frontispiece", "Plate"],
    suffixes: [", recto", ", verso", ", front", ", back"],

    adjustNumericLabel: function (prior, delta) {
        // If it's an integer, this is simple:
        if (parseInt(prior) > 0) {
            return parseInt(prior) + delta;
        }
        // Try roman numerals as a last resort.
        try {
            var arabic = RomanNumerals.toArabic(prior);
            var isUpper = prior === prior.toUpperCase();
            if (arabic > 0) {
                var newLabel = RomanNumerals.toRoman(arabic + delta);
                if (!isUpper) {
                    newLabel = newLabel.toLowerCase();
                }
                return newLabel;
            }
        } catch (e) {
            // Exception thrown! Guess it's not going to work!
        }
        return false;
    },

    getLabelFromPrevPage: function (p, getLabelCallback) {
        var bracketStatus = null;
        var skipSuffixCheck = false;
        while (p > 0) {
            var priorLabel = this.parsePageLabel(getLabelCallback(p - 1));
            // Only carry the bracket status from the prior label, even if
            // you delve deeper into the list...
            if (null === bracketStatus) {
                bracketStatus = priorLabel["brackets"];
            } else {
                priorLabel["brackets"] = bracketStatus;
            }
            if (priorLabel["suffix"] === ", recto" && !skipSuffixCheck) {
                priorLabel["suffix"] = ", verso";
                return this.assemblePageLabel(priorLabel);
            }
            if (priorLabel["suffix"] === ", front" && !skipSuffixCheck) {
                priorLabel["suffix"] = ", back";
                return this.assemblePageLabel(priorLabel);
            }

            var numericLabel = this.adjustNumericLabel(priorLabel["label"], 1);
            if (false !== numericLabel) {
                if (priorLabel["suffix"] === ", verso" && !skipSuffixCheck) {
                    priorLabel["suffix"] = ", recto";
                }
                if (priorLabel["suffix"] === ", back" && !skipSuffixCheck) {
                    priorLabel["suffix"] = ", front";
                }
                priorLabel["label"] = numericLabel;
                return this.assemblePageLabel(priorLabel);
            }

            // If we couldn't determine a label based on the previous page,
            // let's go back deeper... however, when doing this deeper search,
            // we don't want to repeat the recto/verso check since that will
            // cause bad results.
            p--;
            skipSuffixCheck = true;
        }
        return 1;
    },

    getLabel: function (p, getLabelCallback) {
        // Did some experimentation with getLabelFromNextPage to
        // complement getLabelFromPrevPage, but it winded up having
        // too much recursion and making things too slow.
        return this.getLabelFromPrevPage(p, getLabelCallback);
    },

    assemblePageLabel: function (label) {
        var text = label["prefix"] + label["label"] + label["suffix"];
        return label["brackets"] ? "[" + text + "]" : text;
    },

    parsePageLabel: function (text) {
        var brackets = false;
        text = String(text);
        if (text.substring(0, 1) === "[" && text.substring(text.length - 1, text.length) === "]") {
            text = text.substring(1, text.length - 1);
            brackets = true;
        }
        var prefix = "";
        for (let i = 0; i < this.prefixes.length; i++) {
            var currentPrefix = this.prefixes[i];
            if (text.substring(0, currentPrefix.length) === currentPrefix) {
                prefix = currentPrefix;
                text = text.substring(currentPrefix.length);
                break;
            }
        }
        var suffix = "";
        for (let i = 0; i < this.suffixes.length; i++) {
            var currentSuffix = this.suffixes[i];
            if (text.substring(text.length - currentSuffix.length) === currentSuffix) {
                suffix = currentSuffix;
                text = text.substring(0, text.length - currentSuffix.length);
                break;
            }
        }
        var label = text;
        return {
            prefix: prefix,
            label: label,
            suffix: suffix,
            brackets: brackets,
        };
    },

    replaceLabelPart: function (label, part, replacement, allowToggle) {
        if (typeof allowToggle === "undefined") {
            allowToggle = false;
        }
        var parts = this.parsePageLabel(label);
        parts[part] = parts[part] === replacement && allowToggle ? "" : replacement;
        return this.assemblePageLabel(parts);
    },

    toggleBrackets: function (text) {
        var label = this.parsePageLabel(text);
        label["brackets"] = !label["brackets"];
        return this.assemblePageLabel(label);
    },

    toggleCase: function (label) {
        return label === label.toLowerCase() ? label.toUpperCase() : label.toLowerCase();
    },

    toggleRoman: function (text) {
        var label = this.parsePageLabel(text);
        if (parseInt(label["label"]) > 0) {
            label["label"] = RomanNumerals.toRoman(label["label"]);
        } else {
            try {
                label["label"] = RomanNumerals.toArabic(label["label"]);
            } catch (e) {
                return false;
            }
        }
        return this.assemblePageLabel(label);
    },
};

export default MagicLabeler;
