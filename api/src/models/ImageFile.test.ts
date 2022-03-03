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
        image = new ImageFile("test1", new Config({}));
    });

    it("should return the filename", () => {
        expect(image.filename).toEqual("test1");
    });
});
