import VideoFile from "./VideoFile";
import Config from "./Config";

describe("VideoFile", () => {
    let video: VideoFile;
    beforeEach(() => {
        video = new VideoFile("test1.mkv", "/test2", new Config({}));
    });

    it("should return the filename", () => {
        expect(video.filename).toEqual("test1.mkv");
    });

    it("generates appropriate derivative paths", () => {
        expect(video.derivativePath("mp4")).toEqual("/test2/test1.mp4");
    });
});
