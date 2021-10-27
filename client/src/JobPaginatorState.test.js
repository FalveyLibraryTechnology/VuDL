import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import * as JobPaginatorState from "./JobPaginatorState";

describe("JobPaginatorState", () => {
    beforeEach(() => {
        global.alert = jest.fn();
        window.confirm = jest.fn();
    });

    describe("confirmSavedMagicLabels", () => {
        it("should confirm saving magic labels with the count value", () => {
            JobPaginatorState.confirmSavedMagicLabels(3);
            expect(window.confirm).toHaveBeenCalled();
        });
    });

    describe("deletePageValidation", () => {
        it("alerts when order length is less than 2", () => {
            expect(JobPaginatorState.deletePageValidation([])).toBeFalsy();
            expect(alert).toHaveBeenCalled();
        });

        it("fails when confirms", () => {
            window.confirm.mockReturnValue(false);
            expect(JobPaginatorState.deletePageValidation([1, 2, 3])).toBeFalsy();
        });

        it("succeeds", () => {
            window.confirm.mockReturnValue(true);
            expect(JobPaginatorState.deletePageValidation([1, 2, 3])).toBeTruthy();
        });
    });

    describe("getAddedPages", () => {
        it("returns the spliced order by page position", () => {
            const pages = ["test2"];
            const order = [
                {
                    filename: "test1",
                    label: null,
                },
                {
                    filename: "test3",
                    label: null,
                },
            ];

            expect(JobPaginatorState.getAddedPages(order, pages)).toEqual([
                {
                    filename: "test1",
                    label: null,
                },
                {
                    filename: "test2",
                    label: null,
                },
                {
                    filename: "test3",
                    label: null,
                },
            ]);
        });
    });

    describe("getNonRemovedPages", () => {
        it("returns pages that don't match with deleted pages", () => {
            const order = [
                {
                    filename: "test1",
                },
                {
                    filename: "test2",
                },
            ];
            const deletedPages = ["test2"];

            const pages = JobPaginatorState.getNonRemovedPages(order, deletedPages);

            expect(pages).toHaveLength(1);
            expect(pages[0].filename).toEqual("test1");
        });
    });

    describe("getLabel", () => {
        let order;
        beforeEach(() => {
            order = [
                {
                    label: "test1",
                },
                {
                    label: "test2",
                },
                {
                    label: "test3",
                },
            ];
        });

        it("returns null if not existing", () => {
            const imageNumber = 5;

            expect(JobPaginatorState.getLabel(order, imageNumber)).toBeNull();
        });

        it("returns label if existing", () => {
            const imageNumber = 1;

            expect(JobPaginatorState.getLabel(order, imageNumber)).toEqual("test2");
        });
    });

    describe("countMagicLabels", () => {
        it("counts labels not in order array", () => {
            const order = [
                {
                    label: "test1",
                },
                {
                    label: "test2",
                },
                {
                    label: null,
                },
            ];

            expect(JobPaginatorState.countMagicLabels(order, 0)).toBe(1);
        });
    });

    describe("userMustReviewMoreLabels", () => {
        it("returns false when count is less than 0", () => {
            jest.spyOn(JobPaginatorState, "countMagicLabels").mockReturnValue(0);
            expect(JobPaginatorState.userMustReviewMoreLabels([])).toBeFalsy();
        });

        it("returns false when confirm is false", () => {
            jest.spyOn(JobPaginatorState, "countMagicLabels").mockReturnValue(1);
            jest.spyOn(JobPaginatorState, "confirmSavedMagicLabels").mockReturnValue(true);
            expect(JobPaginatorState.userMustReviewMoreLabels([])).toBeFalsy();
        });

        it("returns success", () => {
            jest.spyOn(JobPaginatorState, "countMagicLabels").mockReturnValue(0);
            jest.spyOn(JobPaginatorState, "confirmSavedMagicLabels").mockReturnValue(false);
            expect(JobPaginatorState.userMustReviewMoreLabels([])).toBeFalsy();
        });
    });

    describe("findNewPosition", () => {
        let list;
        beforeEach(() => {
            list = [
                {
                    filename: "test1",
                },
                {
                    filename: "test2",
                },
            ];
        });

        it("returns list length when it doesn't find the listItem", () => {
            expect(JobPaginatorState.findNewPagePosition("test3", list)).toBe(2);
        });

        it("returns found index when it finds the listItem", () => {
            expect(JobPaginatorState.findNewPagePosition("test1", list)).toBe(0);
        });
    });
});
