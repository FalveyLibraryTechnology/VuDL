import AudioFile from "./AudioFile";
import Config from "../models/Config";

//jest.mock("../models/Config");

describe("Audio", () => {
    let audio: AudioFile;
    //let config;
    beforeEach(() => {
        //config = {
        //    ffmpegPath: "/foo/ffmpeg",
        //};
        //use later
        //jest.spyOn(Config, "getInstance").mockReturnValue(config);
        //audio = new AudioFile("test1", "test2", config);
    });

    it("should return the filename", () => {
        expect(audio.filename).toEqual("test1");
    });
});
