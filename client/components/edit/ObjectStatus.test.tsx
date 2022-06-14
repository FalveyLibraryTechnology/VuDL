import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { waitFor } from "@testing-library/react";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import { ObjectStatusProps, ObjectStatus } from "./ObjectStatus";
import { EditorContextProvider, ObjectDetails } from "../../context/EditorContext";
import { FetchContextProvider } from "../../context/FetchContext";

function getMountedObjectStatusComponent(props: ObjectStatusProps) {
    return mount(
        <FetchContextProvider>
            <EditorContextProvider>
                <ObjectStatus {...props} />
            </EditorContextProvider>
        </FetchContextProvider>
    );
}

describe("ObjectStatus", () => {
    let props: ObjectStatusProps;
    let lastRequestUrl: string;
    let response: ObjectDetails;

    beforeEach(() => {
        props = { pid: "foo:123" };
        response = {
        };
        global.fetch = jest.fn((url) => {
            lastRequestUrl = url as string;
            return {
                ok: true,
                status: 200,
                json: async function () {
                    return response;
                },
            };
        });
    });

    it("defaults to unknown state", async () => {
        const wrapper = getMountedObjectStatusComponent(props);
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        expect(lastRequestUrl).toEqual("http://localhost:9000/api/edit/object/foo%3A123/details");
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("displays the state found in the response", async () => {
        response.state = "Inactive";
        const wrapper = getMountedObjectStatusComponent(props);
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        expect(lastRequestUrl).toEqual("http://localhost:9000/api/edit/object/foo%3A123/details");
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
    });
});
