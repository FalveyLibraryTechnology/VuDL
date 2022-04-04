import Config from "../models/Config";
import TikaExtractor from "./TikaExtractor";
import { execSync } from "child_process";
import fs = require("fs");
import tmp = require("tmp");

jest.mock("child_process", () => {
    return { execSync: jest.fn(() => "bar") };
});

describe("TikaExtractor", () => {
    let extractor;
    beforeEach(() => {
        extractor = new TikaExtractor(new Config({ tika_path: "/tika.jar" }));
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("makes an appropriate CLI call", () => {
        const filename = "foo";
        const fd = "fake.fd";
        jest.spyOn(tmp, "fileSync").mockReturnValue({ name: filename, fd });
        const writeSpy = jest.spyOn(fs, "writeSync").mockImplementation(jest.fn());
        const deleteSpy = jest.spyOn(fs, "rmSync").mockImplementation(jest.fn());
        const buffer = Buffer.from("fake");
        expect(extractor.extractText(buffer)).toEqual("bar");
        expect(writeSpy).toHaveBeenCalledTimes(1);
        expect(writeSpy).toHaveBeenCalledWith(fd, buffer);
        expect(deleteSpy).toHaveBeenCalledTimes(1);
        expect(deleteSpy).toHaveBeenCalledWith(filename);
        expect(execSync).toHaveBeenCalledTimes(1);
        expect(execSync).toHaveBeenCalledWith("java -jar /tika.jar --text -eUTF8 foo");
    });
});
