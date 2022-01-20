import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { waitFor } from "@testing-library/react";
import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import Breadcrumbs from "./Breadcrumbs";
import { FetchContextProvider } from "../../context/FetchContext";

describe("Breadcrumb", () => {
    let props;
    let lastRequestUrl;
    let breadcrumbResponse = {};

    beforeEach(() => {
        props = { pid: "foo:1234" };
        global.fetch = jest.fn((url) => {
            lastRequestUrl = url;
            return {
                ok: true,
                status: 200,
                json: async function () {
                    return breadcrumbResponse;
                },
            };
        });
    });

    async function runStandardSnapshotTest() {
        const wrapper = mount(
            <FetchContextProvider>
                <Breadcrumbs {...props} />
            </FetchContextProvider>
        );
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        expect(lastRequestUrl).toEqual("http://localhost:9000/api/edit/object/parents/foo%3A1234");
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
    }

    function getObject(pid, title, parents = []) {
        return { pid, title, parents };
    }

    it("renders using ajax-loaded object data (no parents)", async () => {
        breadcrumbResponse = getObject("foo:1234", "Fake Title");
        await runStandardSnapshotTest();
    });

    it("renders using ajax-loaded object data (simple case)", async () => {
        const parent = getObject("foo:1233", "Fake Parent");
        breadcrumbResponse = getObject("foo:1234", "Fake Title", [parent]);
        await runStandardSnapshotTest();
    });

    it("renders using ajax-loaded object data (many parents)", async () => {
        const parents = [];
        for (let $x = 0; $x < 15; $x++) {
            parents.push(getObject("foo:" + $x, "Fake Parent " + $x));
        }
        breadcrumbResponse = getObject("foo:1234", "Fake Title", parents);
        await runStandardSnapshotTest();
    });

    it("renders using ajax-loaded object data (deep parent chain)", async () => {
        let parents = [];
        for (let $x = 0; $x < 15; $x++) {
            parents = [getObject("foo:" + $x, "Fake Parent " + $x, parents)];
        }
        breadcrumbResponse = getObject("foo:1234", "Fake Title", parents);
        await runStandardSnapshotTest();
    });

    it("renders using ajax-loaded object data (multiple parents with common grandparent)", async () => {
        const grandparent = getObject("foo:1232", "Fake Grandparent");
        const parent1 = getObject("foo:1233", "Fake Parent 1", [grandparent]);
        const parent2 = getObject("foo:1231", "Fake Parent 2", [grandparent]);
        breadcrumbResponse = getObject("foo:1234", "Fake Title", [parent1, parent2]);
        await runStandardSnapshotTest();
    });
});
