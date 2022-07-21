import React from "react";
import { describe, afterEach, expect, it, jest } from "@jest/globals";
import { mount, shallow } from "enzyme";
import { act } from "react-dom/test-utils";
import toJson from "enzyme-to-json";
import DatastreamAgentsContentNotes from "./DatastreamAgentsContentNotes";

describe("DatastreamAgentsContentNotes", () => {
    let notes;
    let setNotes;
    beforeEach(() => {
        notes = ["test1"];
        setNotes = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders", () => {
        const wrapper = shallow(<DatastreamAgentsContentNotes expanded={false} notes={notes} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("edits a note", () => {
        const wrapper = mount(<DatastreamAgentsContentNotes expanded={false} notes={notes} setNotes={setNotes} />);
        act(() => {
            wrapper.find(".noteModifyTextField input").simulate("change", { target: { value: "test2" } });
            wrapper.update();
        });

        expect(setNotes).toHaveBeenCalledWith(notes);
        expect(notes[0]).toEqual("test2");
    });

    it("deletes a note", () => {
        const wrapper = mount(<DatastreamAgentsContentNotes expanded={false} notes={notes} setNotes={setNotes} />);
        act(() => {
            wrapper.find(".deleteNoteButton button").simulate("click");
            wrapper.update();
        });

        expect(setNotes).toHaveBeenCalledWith(notes);
        expect(notes).toHaveLength(0);
    });

    it("adds a note", () => {
        const wrapper = mount(<DatastreamAgentsContentNotes expanded={false} notes={notes} setNotes={setNotes} />);
        act(() => {
            wrapper.find(".addNoteButton button").simulate("click");
            wrapper.update();
        });

        expect(setNotes).toHaveBeenCalledWith(notes);
        expect(notes).toHaveLength(2);
    });
});
