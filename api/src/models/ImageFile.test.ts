import ImageFile from "./ImageFile";
//import Config from "../models/Config";

//jest.mock("../models/Config");

describe("Image", () => {
    let image: ImageFile;
    let config;
    beforeEach(() => {
        config = {
            tesseractPath: "/foo/tesseract",
            textcleanerPath: "/foo/textcleaner",
        };
        //use later
        //jest.spyOn(Config, "getInstance").mockReturnValue(config);
        image = new ImageFile("test1", config);
    });

    it("should return the filename", () => {
        expect(image.filename).toEqual("test1");
    });
});
