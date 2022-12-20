import AudioFile from "./AudioFile";
import Config from "./Config";

describe("Audio", () => {
    let audio: AudioFile;
    beforeEach(() => {
        audio = new AudioFile("test1.flac", "/test2", new Config({}));
    });

    it("should return the filename", () => {
        expect(audio.filename).toEqual("test1.flac");
    });

    it("generates appropriate derivative paths", () => {
        expect(audio.derivativePath("ogg")).toEqual("/test2/test1.ogg");
    });
});
