import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { shallow, mount } from "enzyme";
import toJson from "enzyme-to-json";
import PaginatorZoomy from "./PaginatorZoomy";

const mockInit = jest.fn();
const mockLoad = jest.fn();
jest.mock("../../util/Zoomy", function Zoomy() {
    return {
        init: (element) => mockInit(element),
        load: (img, functionProp) => mockLoad(img, functionProp),
    };
});

describe("PaginatorZoomy", () => {
    let props;

    beforeEach(() => {
        props = {
            img: "testImage",
        };
    });

    it("renders", () => {
        const wrapper = shallow(<PaginatorZoomy {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });

    it("calls zoomy functions on initial state", () => {
        mount(<PaginatorZoomy {...props} />);

        expect(mockInit).toHaveBeenCalled();
        expect(mockLoad).toHaveBeenCalledWith(props.img, expect.any(Function));
    });
});
