import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { renderHook, act } from "@testing-library/react-hooks";
import * as JobPaginatorState from "./JobPaginatorState";
import AjaxHelper from "./AjaxHelper";
import useJobPaginator from "./useJobPaginator";

jest.mock("./AjaxHelper");
jest.mock("./JobPaginatorState");

describe("useJobPaginator", () => {
    let ajax;

    beforeEach(() => {
        ajax = {
            getImageUrl: jest.fn(),
        };
        window.alert = jest.fn();
        window.confirm = jest.fn();
        Object.defineProperty(window, "location", {
            value: {
                assign: jest.fn(),
            },
            writable: true,
        });
        AjaxHelper.getInstance.mockReturnValue(ajax);
    });

    it("increments and decrements the currentPage", async () => {
        const { result } = await renderHook(() => useJobPaginator());

        act(() => {
            result.current.action.setOrder([
                {
                    filename: "test1",
                    label: null,
                },
                {
                    filename: "test2",
                    label: null,
                },
            ]);
        });

        act(() => {
            result.current.action.nextPage();
        });

        expect(result.current.state.currentPage).toBe(1);

        act(() => {
            result.current.action.prevPage();
        });

        expect(result.current.state.currentPage).toBe(0);
    });

    describe("setLabel", () => {
        it("changes the label if null", () => {
            const { result } = renderHook(() => useJobPaginator());

            act(() => {
                result.current.action.setOrder([
                    {
                        filename: "test1",
                        label: null,
                    },
                ]);
            });

            act(() => {
                result.current.action.setLabel(0, "test2");
            });

            expect(result.current.state.order[0].label).toEqual("test2");
        });

        it("does not change the label if index is out of range", () => {
            const { result } = renderHook(() => useJobPaginator());

            act(() => {
                result.current.action.setOrder([
                    {
                        filename: "test1",
                        label: "test2",
                    },
                ]);
            });

            act(() => {
                result.current.action.setLabel(1, "test3");
            });

            expect(result.current.state.order[0].label).not.toEqual("test3");
        });
    });

    describe("getMagicLabel", () => {
        it("gets current label if not null", () => {
            jest.spyOn(JobPaginatorState, "getLabel").mockReturnValue("test2");
            const { result } = renderHook(() => useJobPaginator());

            act(() => {
                expect(result.current.action.getMagicLabel(0)).toEqual("test2");
            });
        });

        it("gets magic label if null", () => {
            jest.spyOn(JobPaginatorState, "getLabel").mockReturnValue(null);
            const { result } = renderHook(() => useJobPaginator());

            act(() => {
                result.current.action.setOrder([
                    {
                        filename: "test1",
                        label: "1",
                    },
                ]);
            });

            act(() => {
                expect(result.current.action.getMagicLabel(1)).toEqual("2");
            });
        });
    });

    describe("deletePage", () => {
        it("removes an order entry", () => {
            jest.spyOn(JobPaginatorState, "deletePageValidation").mockReturnValue(true);
            ajax.getImageUrl.mockReturnValue("www.image.com/imageName");
            jest.spyOn(JobPaginatorState, "deleteImage").mockImplementation((url, success) => {
                success();
            });
            jest.spyOn(JobPaginatorState, "getNonRemovedPages").mockReturnValue([]);

            const { result } = renderHook(() => useJobPaginator());

            act(() => {
                result.current.action.setOrder([
                    {
                        filename: "imageName",
                    },
                ]);
            });

            act(() => {
                result.current.action.deletePage();
            });

            expect(JobPaginatorState.deletePageValidation).toHaveBeenCalled;
        });
    });

    describe("save", () => {
        it("saves magic labels", () => {
            const userMustReviewMoreLabelsMock = jest
                .spyOn(JobPaginatorState, "userMustReviewMoreLabels")
                .mockReturnValue(true);
            const { result } = renderHook(() => useJobPaginator());

            act(() => {
                result.current.action.setOrder([
                    {
                        filename: "test1",
                        label: "1",
                    },
                    {
                        filename: "test2",
                        label: null,
                    },
                ]);
            });

            act(() => {
                result.current.action.save(false);
            });

            expect(result.current.state.order[1].label).toBeNull();

            userMustReviewMoreLabelsMock.mockReturnValue(false);
            JobPaginatorState.getLabel.mockReturnValueOnce("1");
            JobPaginatorState.getLabel.mockReturnValueOnce(null);
            act(() => {
                result.current.action.save(false);
            });

            expect(result.current.state.order[1].label).toEqual("2");
        });

        it("updates job", async () => {
            jest.spyOn(JobPaginatorState, "userMustReviewMoreLabels").mockReturnValue(false);
            const validatePublishSpy = jest.spyOn(JobPaginatorState, "validatePublish").mockResolvedValue(false);
            JobPaginatorState.putJob.mockImplementation((p1, success) => {
                success();
            });
            const { result } = renderHook(() => useJobPaginator("testCategory", "testJob"));
            act(() => {
                result.current.action.setOrder([
                    {
                        filename: "test1",
                        label: "1",
                    },
                    {
                        filename: "test2",
                        label: null,
                    },
                ]);
            });

            await act(async () => {
                await result.current.action.save(true);
            });

            expect(validatePublishSpy).toHaveBeenCalled();
            expect(JobPaginatorState.putJob).not.toHaveBeenCalled();
            validatePublishSpy.mockResolvedValue(true);

            await act(async () => {
                await result.current.action.save(true);
            });

            const { category, job, order } = result.current.state;
            expect(JobPaginatorState.putJob).toHaveBeenCalledWith(
                expect.objectContaining({
                    category,
                    job,
                    order,
                    published: true,
                }),
                expect.any(Function),
                expect.any(Function)
            );
            expect(window.location.assign).toHaveBeenCalledWith("/paginate");
        });
    });

    describe("autonumberFollowingPages", () => {
        it("returns false when order image is undefined", () => {
            jest.spyOn(JobPaginatorState, "countMagicLabels").mockReturnValue(0);
            window.confirm.mockReturnValue(false);

            const { result } = renderHook(() => useJobPaginator());
            act(() => {
                result.current.action.setOrder([
                    {
                        filename: "test1",
                        label: "1",
                    },
                    {
                        filename: "test2",
                        label: "2",
                    },
                ]);
            });

            act(() => {
                result.current.action.autonumberFollowingPages();
            });

            expect(result.current.state.order[1].label).not.toBeNull();
        });

        it("returns false when order image is undefined", () => {
            jest.spyOn(JobPaginatorState, "countMagicLabels").mockReturnValue(0);
            window.confirm.mockReturnValue(true);

            const { result } = renderHook(() => useJobPaginator());
            act(() => {
                result.current.action.setOrder([
                    {
                        filename: "test1",
                        label: "1",
                    },
                    {
                        filename: "test2",
                        label: "2",
                    },
                ]);
            });

            act(() => {
                result.current.action.autonumberFollowingPages();
            });

            expect(result.current.state.order[1].label).toBeNull();
        });
    });

    describe("getImageUrl", () => {
        it("returns false when order image is undefined", () => {
            const { result } = renderHook(() => useJobPaginator());

            expect(result.current.action.getImageUrl(undefined, 2)).toBeFalsy();
        });

        it("calls getImageUrl with appropriate params", () => {
            const { result } = renderHook(() => useJobPaginator("testCategory", "testJob"));

            expect(result.current.action.getImageUrl({ filename: "image.png" }, 2, 2)).toBeFalsy();
            expect(ajax.getImageUrl).toHaveBeenCalledWith("testCategory", "testJob", "image.png", 2);
        });
    });
});
