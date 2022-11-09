import React from "react";
import { describe, afterEach, expect, it, jest } from "@jest/globals";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";
import DatastreamProcessMetadataTask from "./DatastreamProcessMetadataTask";
import { ProcessMetadataTask } from "../../../context/ProcessMetadataContext";

const mockUseEditorContext = jest.fn();
jest.mock("../../../context/EditorContext", () => ({
    useEditorContext: () => {
        return mockUseEditorContext();
    },
}));

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
        const wrapper = shallow(
            <DatastreamProcessMetadataTask
                task={task}
                deleteTask={jest.fn()}
                addBelow={jest.fn()}
                setAttributes={jest.fn()}
            />
        );

        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("renders with tool presets", () => {
        editorValues.state.toolPresets.push({ label: "My Tool" });
        const wrapper = shallow(
            <DatastreamProcessMetadataTask
                task={task}
                deleteTask={jest.fn()}
                addBelow={jest.fn()}
                setAttributes={jest.fn()}
            />
        );

        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
