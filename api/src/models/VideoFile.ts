import AbstractAVFile from "./AbstractAVFile";
import Config from "./Config";

class VideoFile extends AbstractAVFile {
    extensions: Array<string> = ["MP4"];

    public static build(filename: string, dir: string): VideoFile {
        return new VideoFile(filename, dir, Config.getInstance());
    }

    static fromRaw(raw: Record<string, string>, config: Config = null): VideoFile {
        return new VideoFile(raw.filename, raw.label, config ?? Config.getInstance());
    }
}

export default VideoFile;
