import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import * as JobPaginatorState from "./JobPaginatorState";
import AjaxHelper from "./AjaxHelper";
jest.mock("./AjaxHelper");

describe("JobPaginatorState", () => {
    let ajax;

    beforeEach(() => {
        global.alert = jest.fn();
        window.confirm = jest.fn();
        ajax = {
            getJobUrl: jest.fn(),
            getJSON: jest.fn(),
            ajax: jest.fn(),
        };
        AjaxHelper.getInstance.mockReturnValue(ajax);
    });

    describe("confirmSavedMagicLabels", () => {
        it("should confirm saving magic labels with the count value", () => {
            JobPaginatorState.confirmSavedMagicLabels(3);
            expect(window.confirm).toHaveBeenCalled();
        });
    });

    describe("getJob", () => {
        it("successfully returns a value", async () => {
            ajax.getJobUrl.mockReturnValue("test1");
            ajax.getJSON.mockImplementation((p1, p2, success) => {
                success("test2");
            });

            const job = await JobPaginatorState.getJob("test3", "test4");

            expect(job).toEqual("test2");
            expect(ajax.getJSON).toHaveBeenCalledWith("test1", null, expect.any(Function));
            expect(ajax.getJobUrl).toHaveBeenCalledWith("test3", "test4");
        });
    });

    describe("getStatus", () => {
        it("calls appropriate values", async () => {
            ajax.getJobUrl.mockReturnValue("test1");
            ajax.getJSON.mockImplementation((p1, p2, success) => {
                success("test2");
            });

            const status = await JobPaginatorState.getStatus("testCategory", "testJob");
            expect(status).toEqual("test2");
            expect(ajax.getJSON).toHaveBeenCalledWith("test1", null, expect.any(Function));
            expect(ajax.getJobUrl).toHaveBeenCalledWith("testCategory", "testJob", "/status");
        });
    });

    describe("deleteImage", () => {
        it("calls appropriate value", () => {
            JobPaginatorState.deleteImage("www.testurl.com", "testSuccess", "testError");

            expect(ajax.ajax).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: "DELETE",
                    url: "www.testurl.com",
                    success: "testSuccess",
                    error: "testError",
                })
            );
        });
    });

    describe("putJob", () => {
        it("calls appropriate value", () => {
            ajax.getJobUrl.mockReturnValue("www.testurl.com");
            const data = {
                category: "testCategory",
                job: "testJob",
                order: "testOrder",
                published: "testPublished",
            };
            JobPaginatorState.putJob(data, "testSuccess", "testError");

            expect(ajax.ajax).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: "PUT",
                    url: "www.testurl.com",
                    data: JSON.stringify({
                        order: "testOrder",
                        published: "testPublished",
                    }),
                    success: "testSuccess",
                    error: "testError",
                })
            );
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

    describe("validatePublish", () => {
        let statusObject;
        beforeEach(() => {
            statusObject = {
                derivatives: {
                    expected: 2,
                    processed: 1,
                },
            };
            ajax.getJSON.mockImplementation((p1, p2, success) => {
                success(statusObject);
            });
        });
        it("sends alert if number of process images is less than expected", async () => {
            const response = await JobPaginatorState.validatePublish("testCategory", "testJob");

            expect(response).toBeFalsy();
            expect(global.alert).toHaveBeenCalled();
        });

        it("calls confirmation window", async () => {
            statusObject.derivatives.processed = 3;
            window.confirm.mockReturnValue(false);

            const response = await JobPaginatorState.validatePublish("testCategory", "testJob");

            expect(response).toBeFalsy();
            expect(window.confirm).toHaveBeenCalled();
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
});
