import Config from "./Config";
import ImageFile from "./ImageFile";

// We don't want JIMP loading to interfere with the test suite (and we
// don't really want to do any image manipulation during testing).
jest.mock("jimp", () => {
    return {};
});

describe("Image", () => {
    let image: ImageFile;
    beforeEach(() => {
        image = new ImageFile("/foo/test1.tif", new Config({}));
    });

    it("should return the filename", () => {
        expect(image.filename).toEqual("/foo/test1.tif");
    });

    it("generates appropriate derivative paths", () => {
        expect(image.derivativePath("HUGE", "gif")).toEqual("/foo/test1/HUGE/test1.gif");
    });
});
