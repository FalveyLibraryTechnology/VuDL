import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render } from "@testing-library/react";
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
        const { asFragment } = render(<PaginatorZoomy {...props} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it("calls zoomy functions on initial state", () => {
        render(<PaginatorZoomy {...props} />);

        expect(mockInit).toHaveBeenCalled();
        expect(mockLoad).toHaveBeenCalledWith(props.img, expect.any(Function));
    });
});
