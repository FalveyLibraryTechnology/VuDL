import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import BulkEditor from "./BulkEditor";

const mockUseEditorContext = jest.fn();
jest.mock("../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));

const mockUseFetchContext = jest.fn();
jest.mock("../../context/FetchContext", () => ({
    useFetchContext: () => {
        return mockUseFetchContext();
    },
}));
jest.mock("../shared/BasicBreadcrumbs", () => () => "BasicBreadcrumbs");

jest.mock("../edit/PidPicker", () => (props) => {
    return "PidPicker: " + JSON.stringify({ selected: props.selected });
});

describe("BulkEditor", () => {
    let editorValues;
    let fetchContextValues;
    beforeEach(() => {
        editorValues = {
            state: {
                licensesCatalog: {
                    testLicenseKey: {
                        name: "testLicense",
                    },
                },
                dublinCoreFieldCatalog: {
                    "dc:identifier": { type: "locked", label: "Identifier" },
                    "dc:title": { type: "text", label: "Title" },
                    "dc:description": { type: "html", label: "Description" },
                },
            },
            action: {
                initializeCatalog: jest.fn(),
            },
        };
        fetchContextValues = {
            action: {
                fetchText: jest.fn(),
                fetchJSON: jest.fn(),
            },
        };
        mockUseEditorContext.mockReturnValue(editorValues);
        mockUseFetchContext.mockReturnValue(fetchContextValues);
    });

    it("renders", () => {
        const { asFragment } = render(<BulkEditor />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("reports failure if it receives bad JSON", async () => {
        render(<BulkEditor />);
        await act(async () => {
            fireEvent.click(screen.getByRole("radio", { name: "Change DC Fields" }));
        });
        const input = screen.getByLabelText("Search Query");
        fireEvent.blur(input, {
            target: {
                value: "*:*",
            },
        });
        const fetchButton = screen.getByText("Fetch Records");
        fetchContextValues.action.fetchText.mockResolvedValueOnce("invalid JSON");
        await act(async () => {
            fireEvent.click(fetchButton);
        });
        expect(fetchContextValues.action.fetchText).toHaveBeenCalledWith(
            "http://localhost:9000/api/edit/query/solr",
            {
                body: '{\"query\":\"(*:*)\",\"rows\":50}',
                method: "POST",
            },
            { "Content-Type": "application/json" },
        );
        const resultList = screen.getByTitle("Selected Records");
        expect(resultList.innerHTML).toEqual("Unexpected token 'i', \"invalid JSON\" is not valid JSON");
    });

    it("changes nothing if you submit without making selections", async () => {
        render(<BulkEditor />);
        await act(async () => {
            fireEvent.click(screen.getByRole("radio", { name: "Change License" }));
        });
        const applyButton = screen.getByText("Apply Changes");
        await act(async () => {
            fireEvent.click(applyButton);
        });
        const resultList = screen.getByTitle("Bulk Edit Results");
        expect(resultList.innerHTML).toEqual("No change requested.");
    });

    it("reports empty Solr results and takes no action if they are submitted", async () => {
        render(<BulkEditor />);
        await act(async () => {
            fireEvent.click(screen.getByRole("radio", { name: "Change License" }));
        });
        const input = screen.getByLabelText("Search Query");
        fireEvent.blur(input, {
            target: {
                value: "*:*",
            },
        });
        const fetchButton = screen.getByText("Fetch Records");
        fetchContextValues.action.fetchText.mockResolvedValueOnce('{"numFound": 0, "docs": []}');
        await act(async () => {
            fireEvent.click(fetchButton);
        });
        expect(fetchContextValues.action.fetchText).toHaveBeenCalledWith(
            "http://localhost:9000/api/edit/query/solr",
            {
                body: '{\"query\":\"(*:*)\",\"rows\":50}',
                method: "POST",
            },
            { "Content-Type": "application/json" },
        );
        const recordList = screen.getByTitle("Selected Records");
        expect(recordList.innerHTML).toEqual("No results found.");
        const licenseControl = screen.getByRole("combobox", { name: "Choose New License" });
        await act(async () => {
            fireEvent.mouseDown(licenseControl);
        });
        await act(async () => {
            fireEvent.click(screen.getByText("testLicense"));
        });
        const applyButton = screen.getByText("Apply Changes");
        await act(async () => {
            fireEvent.click(applyButton);
        });
        const resultList = screen.getByTitle("Bulk Edit Results");
        expect(resultList.innerHTML).toEqual("No records selected.");
    });

    it("performs a Solr search and changes a license", async () => {
        render(<BulkEditor />);
        await act(async () => {
            fireEvent.click(screen.getByRole("radio", { name: "Change License" }));
        });
        const input = screen.getByLabelText("Search Query");
        fireEvent.blur(input, {
            target: {
                value: "*:*",
            },
        });
        const fetchButton = screen.getByText("Fetch Records");
        fetchContextValues.action.fetchText.mockResolvedValueOnce(
            '{"numFound": 2, "docs": [{"id": "foo", "title": "Foo"}, {"id": "bar", "title": "Bar"}]}',
        );
        await act(async () => {
            fireEvent.click(fetchButton);
        });
        expect(fetchContextValues.action.fetchText).toHaveBeenCalledWith(
            "http://localhost:9000/api/edit/query/solr",
            {
                body: '{\"query\":\"(*:*)\",\"rows\":50}',
                method: "POST",
            },
            { "Content-Type": "application/json" },
        );
        const recordList = screen.getByTitle("Selected Records");
        expect(recordList.innerHTML).toEqual("foo:\tFoo\nbar:\tBar\n");

        const licenseControl = screen.getByRole("combobox", { name: "Choose New License" });
        await act(async () => {
            fireEvent.mouseDown(licenseControl);
        });
        await act(async () => {
            fireEvent.click(screen.getByText("testLicense"));
        });
        const applyButton = screen.getByText("Apply Changes");
        fetchContextValues.action.fetchText.mockResolvedValueOnce("success");
        fetchContextValues.action.fetchText.mockResolvedValueOnce("failure");
        await act(async () => {
            fireEvent.click(applyButton);
        });
        expect(fetchContextValues.action.fetchText).toHaveBeenCalledWith(
            "http://localhost:9000/api/edit/object/foo/datastream/LICENSE/license",
            { body: '{"licenseKey":"testLicenseKey"}', method: "POST" },
            { "Content-Type": "application/json" },
        );
        expect(fetchContextValues.action.fetchText).toHaveBeenCalledWith(
            "http://localhost:9000/api/edit/object/bar/datastream/LICENSE/license",
            { body: '{"licenseKey":"testLicenseKey"}', method: "POST" },
            { "Content-Type": "application/json" },
        );
        const resultList = screen.getByTitle("Bulk Edit Results");
        expect(resultList.innerHTML).toEqual("(1/2) foo: success\n(2/2) bar: failure\n");
    });

    it("replaces text in a DC field", async () => {
        render(<BulkEditor />);
        await act(async () => {
            fireEvent.click(screen.getByRole("radio", { name: "Change DC Fields" }));
        });
        const input = screen.getByLabelText("Search Query");
        fireEvent.blur(input, {
            target: {
                value: "*:*",
            },
        });
        const fetchButton = screen.getByText("Fetch Records");
        fetchContextValues.action.fetchText.mockResolvedValueOnce(
            '{"numFound": 1, "docs": [{"id": "foo", "title": "foo bar"}]}',
        );
        await act(async () => {
            fireEvent.click(fetchButton);
        });
        expect(fetchContextValues.action.fetchText).toHaveBeenCalledWith(
            "http://localhost:9000/api/edit/query/solr",
            {
                body: '{\"query\":\"(*:*)\",\"rows\":50}',
                method: "POST",
            },
            { "Content-Type": "application/json" },
        );
        const recordList = screen.getByTitle("Selected Records");
        expect(recordList.innerHTML).toEqual("foo:\tfoo bar\n");

        const findInput = screen.getByLabelText("Find");
        fireEvent.blur(findInput, {
            target: {
                value: "foo",
            },
        });

        const replaceInput = screen.getByLabelText("Replace With");
        fireEvent.blur(replaceInput, {
            target: {
                value: "bar",
            },
        });

        fetchContextValues.action.fetchJSON.mockResolvedValueOnce({
            metadata: { "dc:title": ["foo bar"] },
        });
        fetchContextValues.action.fetchText.mockResolvedValueOnce("success");
        const replaceButton = screen.getByText("Replace in Field");
        await act(async () => {
            fireEvent.click(replaceButton);
        });

        expect(fetchContextValues.action.fetchJSON).toHaveBeenCalledWith(
            "http://localhost:9000/api/edit/object/foo/details",
        );
        expect(fetchContextValues.action.fetchText).toHaveBeenCalledWith(
            "http://localhost:9000/api/edit/object/foo/datastream/DC/dublinCore",
            {
                body: '{"metadata":{"dc:title":["bar bar"]}}',
                method: "POST",
            },
            { "Content-Type": "application/json" },
        );
        const resultList = screen.getByTitle("Bulk Edit Results");
        expect(resultList.innerHTML).toEqual("(1/1) foo: success\n");
    });

    it("previews text changes", async () => {
        render(<BulkEditor />);
        await act(async () => {
            fireEvent.click(screen.getByRole("radio", { name: "Change DC Fields" }));
        });
        const input = screen.getByLabelText("Search Query");
        fireEvent.blur(input, {
            target: {
                value: "*:*",
            },
        });
        const fetchButton = screen.getByText("Fetch Records");
        fetchContextValues.action.fetchText.mockResolvedValueOnce(
            '{"numFound": 1, "docs": [{"id": "foo", "title": "Foo"}]}',
        );
        await act(async () => {
            fireEvent.click(fetchButton);
        });
        const recordList = screen.getByTitle("Selected Records");
        expect(recordList.innerHTML).toEqual("foo:\tFoo\n");

        const findInput = screen.getByLabelText("Find");
        fireEvent.blur(findInput, {
            target: {
                value: "foo",
            },
        });

        const replaceInput = screen.getByLabelText("Replace With");
        fireEvent.blur(replaceInput, {
            target: {
                value: "bar",
            },
        });

        fetchContextValues.action.fetchJSON.mockResolvedValueOnce({
            metadata: { "dc:title": ["foo bar"] },
        });
        fetchContextValues.action.fetchText.mockResolvedValueOnce("success");
        const replaceButton = screen.getByText("Preview Changes");
        await act(async () => {
            fireEvent.click(replaceButton);
        });

        expect(fetchContextValues.action.fetchJSON).toHaveBeenCalledWith(
            "http://localhost:9000/api/edit/object/foo/details",
        );
        expect(fetchContextValues.action.fetchText).toHaveBeenCalledWith(
            "http://localhost:9000/api/edit/query/solr",
            {
                body: '{"query":"(*:*)","rows":50}',
                method: "POST",
            },
            { "Content-Type": "application/json" },
        );
        const resultList = screen.getByTitle("Bulk Edit Results");
        expect(resultList.innerHTML).toEqual("foo:\n  Old: foo bar\n  New: bar bar\n");
    });

    it("handles errors during license updates", async () => {
        render(<BulkEditor />);
        await act(async () => {
            fireEvent.click(screen.getByRole("radio", { name: "Change License" }));
        });
        const input = screen.getByLabelText("Search Query");
        fireEvent.blur(input, {
            target: {
                value: "*:*",
            },
        });
        const fetchButton = screen.getByText("Fetch Records");
        fetchContextValues.action.fetchText.mockResolvedValueOnce(
            '{"numFound": 2, "docs": [{"id": "foo", "title": "Foo"}, {"id": "bar", "title": "Bar"}]}',
        );
        await act(async () => {
            fireEvent.click(fetchButton);
        });
        expect(fetchContextValues.action.fetchText).toHaveBeenCalledWith(
            "http://localhost:9000/api/edit/query/solr",
            {
                body: '{\"query\":\"(*:*)\",\"rows\":50}',
                method: "POST",
            },
            { "Content-Type": "application/json" },
        );
        const recordList = screen.getByTitle("Selected Records");
        expect(recordList.innerHTML).toEqual("foo:\tFoo\nbar:\tBar\n");

        const licenseControl = screen.getByRole("combobox", { name: "Choose New License" });
        await act(async () => {
            fireEvent.mouseDown(licenseControl);
        });
        await act(async () => {
            fireEvent.click(screen.getByText("testLicense"));
        });
        const applyButton = screen.getByText("Apply Changes");
        fetchContextValues.action.fetchText.mockResolvedValueOnce("success");
        fetchContextValues.action.fetchText.mockRejectedValue(new Error("kaboom"));
        await act(async () => {
            fireEvent.click(applyButton);
        });
        expect(fetchContextValues.action.fetchText).toHaveBeenCalledWith(
            "http://localhost:9000/api/edit/object/foo/datastream/LICENSE/license",
            { body: '{"licenseKey":"testLicenseKey"}', method: "POST" },
            { "Content-Type": "application/json" },
        );
        expect(fetchContextValues.action.fetchText).toHaveBeenCalledWith(
            "http://localhost:9000/api/edit/object/bar/datastream/LICENSE/license",
            { body: '{"licenseKey":"testLicenseKey"}', method: "POST" },
            { "Content-Type": "application/json" },
        );
        const resultList = screen.getByTitle("Bulk Edit Results");
        expect(resultList.innerHTML).toEqual("kaboom");
    });
});
