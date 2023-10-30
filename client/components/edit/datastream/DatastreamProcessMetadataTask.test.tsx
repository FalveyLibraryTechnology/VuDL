import React from "react";
import { describe, afterEach, expect, it, jest } from "@jest/globals";
import { mount } from "enzyme";
import renderer from "react-test-renderer";
import DatastreamProcessMetadataTask from "./DatastreamProcessMetadataTask";
import BlurSavingTextField from "../../shared/BlurSavingTextField";
import { ProcessMetadataTask } from "../../../context/ProcessMetadataContext";
import Delete from "@mui/icons-material/Delete";
import AddCircle from "@mui/icons-material/AddCircle";
import { act } from "react-dom/test-utils";
import NativeSelect from "@mui/material/NativeSelect";

const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));

jest.mock("../../shared/BlurSavingTextField", () => (props) => `BlurSavingTextField: ${JSON.stringify(props)}`);
jest.mock("@mui/material/Grid", () => (props) => props.children);
jest.mock("@mui/icons-material/AddCircle", () => (props) => props.titleAccess);
jest.mock("@mui/icons-material/Delete", () => (props) => props.titleAccess);

describe("DatastreamProcessMetadataTask", () => {
    let editorValues;
    let task: ProcessMetadataTask;

    beforeEach(() => {
        editorValues = {
            state: {
                toolPresets: [],
            },
        };
        task = {
            sequence: "seq",
            label: "lab",
            description: "des",
            individual: "ind",
            toolLabel: "tool-lab",
            toolDescription: "tool-des",
            toolMake: "tool-mak",
            toolVersion: "tool-ver",
            toolSerialNumber: "tool-ser",
        };
        mockUseEditorContext.mockReturnValue(editorValues);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders without tool presets", () => {
        const tree = renderer.create(
            <DatastreamProcessMetadataTask
                task={task}
                deleteTask={jest.fn()}
                addBelow={jest.fn()}
                setAttributes={jest.fn()}
            />,
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });

    it("renders with tool presets", () => {
        editorValues.state.toolPresets.push({ label: "My Tool" });
        const tree = renderer.create(
            <DatastreamProcessMetadataTask
                task={task}
                deleteTask={jest.fn()}
                addBelow={jest.fn()}
                setAttributes={jest.fn()}
            />,
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });

    it("applies tool presets", () => {
        editorValues.state.toolPresets.push({ label: "Tool 1" });
        editorValues.state.toolPresets.push({ label: "Tool 2", serialNumber: "1234", version: "1" });
        const setAttributes = jest.fn();
        const wrapper = mount(
            <DatastreamProcessMetadataTask
                task={{}}
                deleteTask={jest.fn()}
                addBelow={jest.fn()}
                setAttributes={setAttributes}
            />,
        );

        act(() => {
            wrapper
                .find(NativeSelect)
                .props()
                .onChange({ target: { value: "1" } });
        });
        wrapper.update();
        act(() => {
            wrapper.find("button").at(0).simulate("click");
        });

        expect(setAttributes).toHaveBeenCalledWith(
            {
                toolDescription: "",
                toolLabel: "Tool 2",
                toolMake: "",
                toolSerialNumber: "1234",
                toolVersion: "1",
            },
            true,
        );
    });

    it("saves values", () => {
        const setAttributes = jest.fn();
        const wrapper = mount(
            <DatastreamProcessMetadataTask
                task={task}
                deleteTask={jest.fn()}
                addBelow={jest.fn()}
                setAttributes={setAttributes}
            />,
        );

        const attributes = [
            "sequence",
            "label",
            "description",
            "individual",
            "toolLabel",
            "toolDescription",
            "toolMake",
            "toolVersion",
            "toolSerialNumber",
        ];
        act(() => {
            attributes.forEach((value, index) => {
                wrapper
                    .find(BlurSavingTextField)
                    .at(index)
                    .props()
                    .setValue(value + "foo");
            });
        });
        attributes.forEach((value, index) => {
            expect(setAttributes).toHaveBeenNthCalledWith(index + 1, { [value]: `${value}foo` });
        });
    });

    it("deletes tasks", () => {
        const deleteTask = jest.fn();
        const wrapper = mount(
            <DatastreamProcessMetadataTask
                task={task}
                deleteTask={deleteTask}
                addBelow={jest.fn()}
                setAttributes={jest.fn()}
            />,
        );

        act(() => {
            wrapper.find(Delete).parent().props().onClick();
        });
        expect(deleteTask).toHaveBeenCalled();
    });

    it("inserts values below", () => {
        const addBelow = jest.fn();
        const wrapper = mount(
            <DatastreamProcessMetadataTask
                task={task}
                deleteTask={jest.fn()}
                addBelow={addBelow}
                setAttributes={jest.fn()}
            />,
        );

        act(() => {
            wrapper.find(AddCircle).parent().props().onClick();
        });
        expect(addBelow).toHaveBeenCalled();
    });
});
