import DateSanitizer from "./DateSanitizer";

describe("DateSanitizer", () => {
    test.each([
        ["n.d.", null, "Unknown date, no space."],
        ["n. d.", null, "Unknown date, with space"],
        ["February 29, 2008", "2008-02-29T00:00:00Z", "Legal leap year date, human readable M D, Y"],
        ["February 29, 2009", "2009-02-01T00:00:00Z", "Illegal leap year date, human readable M D, Y"],
        ["01 June 1467", "1467-06-01T00:00:00Z", "Date far in the past, human readable D M Y"],
        ["1872", "1872-01-01T00:00:00Z", "Just a year"],
        ["[1872]", "1872-01-01T00:00:00Z", "Just a year, in brackets"],
        ["1872&1873", "1872-01-01T00:00:00Z", "Two years joined with ampersand"],
        ["1888-01", "1888-01-01T00:00:00Z", "Year-month, numeric format"],
        ["1888-28", "1888-01-01T00:00:00Z", "Year-illegal month, numeric format"],
        ["1888-05-12", "1888-05-12T00:00:00Z", "Year-month-day, numeric format"],
        ["1888-05-99", "1888-05-01T00:00:00Z", "Year-month-illegal day, numeric format"],
        ["1888--05--12", "1888-05-12T00:00:00Z", "Year--month--day, with double dashes"],
        ["693-01-07", "0693-01-01T00:00:00Z", "Year-month-day, with three-digit year"],
        ["693-1-7", "0693-01-01T00:00:00Z", "Year-month-day, with no leading zeroes"],
    ])("DateSanitizer.sanitize(%s) => %s. Description: %s", (testInput, expectedValue) => {
        expect(DateSanitizer.sanitize(testInput)).toEqual(expectedValue);
    });
});
