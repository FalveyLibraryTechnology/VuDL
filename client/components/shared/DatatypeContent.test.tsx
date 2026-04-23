import { describe, beforeEach, expect, it } from "@jest/globals";
import { render } from "@testing-library/react";
import DatatypeContent from "./DatatypeContent";

describe("DatatypeContent", () => {
    let props;
    beforeEach(() => {
        props = {
            data: "",
            mimeType: "",
        };
    });

    it("renders img on image primaryType", () => {
        props.data = "test1";
        props.mimeType = "image/jpeg";

        const { container, asFragment } = render(<DatatypeContent {...props} />);
        expect(container.querySelector("img")).toBeTruthy();
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders textarea on text primaryType", () => {
        props.data = "testXml";
        props.mimeType = "text/xml";

        const { container, asFragment } = render(<DatatypeContent {...props} />);
        expect(container.querySelector("div")).toBeTruthy();
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders object on application/pdf", () => {
        props.data = "testPdf";
        props.mimeType = "application/pdf";

        const { container, asFragment } = render(<DatatypeContent {...props} />);
        expect(container.querySelector("object")).toBeTruthy();
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders audio tag on audio primaryType", () => {
        props.data = "testAudio";
        props.mimeType = "audio/mpeg3";

        const { container, asFragment } = render(<DatatypeContent {...props} />);
        expect(container.querySelector("audio")).toBeTruthy();
        expect(asFragment()).toMatchSnapshot();
    });
});
