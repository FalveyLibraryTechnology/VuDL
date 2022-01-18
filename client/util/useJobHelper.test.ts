import { describe, expect, test } from "@jest/globals";

import { getAgeString } from "./useJobHelper";

describe("useJobHelper", () => {
    test.each([
        [1, "1 minute old"],
        [2, "2 minutes old"],
        [61, "1 hour old"],
        [121, "2 hours old"],
        [1440, "1 day old"],
        [2881, "2 days old"],
        [10080, "1 week old"],
        [20160, "2 weeks old"],
        [524160, "1 year old"],
        [1048320, "2 years old"],
    ])("getAgeString(%i)", (testInput, expectedValue) => {
        expect(getAgeString(testInput)).toEqual(expectedValue);
    });
});
