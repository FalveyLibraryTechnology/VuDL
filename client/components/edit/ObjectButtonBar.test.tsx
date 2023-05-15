import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { waitFor } from "@testing-library/react";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import * as EditorContextModule from "../../context/EditorContext";
import ObjectButtonBar from "./ObjectButtonBar";

jest.mock("./EditParentsButton", () => () => "EditParentsButton");
jest.mock("./ObjectPreviewButton", () => () => "ObjectPreviewButton");
jest.mock("./ObjectStatus", () => () => "ObjectStatus");
jest.mock(
    "@mui/icons-material/Refresh",
    () =>
        ({ titleAccess }: { titleAccess: string }) =>
            titleAccess
);

describe("ObjectButtonBar", () => {
    let pid: string;
    let mockContext;

    beforeEach(() => {
        pid = "foo:123";
        mockContext = {
            state: { objectDetailsStorage: {}, vufindUrl: "" },
            action: {
                clearPidFromChildListStorage: jest.fn(),
            },
        };
        jest.spyOn(EditorContextModule, "useEditorContext").mockReturnValue(mockContext);
    });

    it("renders correctly", async () => {
        const wrapper = mount(<ObjectButtonBar pid={pid} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("can refresh a list of children", async () => {
        const wrapper = mount(<ObjectButtonBar pid={pid} />);
        const refreshIcon = wrapper.find("button").at(0);
        expect(refreshIcon.text()).toEqual("Refresh children");
        refreshIcon.simulate("click");
        await waitFor(() => expect(mockContext.action.clearPidFromChildListStorage).toHaveBeenCalledTimes(1));
        expect(mockContext.action.clearPidFromChildListStorage).toHaveBeenCalledWith(pid);
    });
});
