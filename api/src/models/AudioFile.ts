// import ffmpeg = require("fluent-ffmpeg");
import fs = require("fs");
import path = require("path");

// TODO: reintroduce config when needed: import Config from "./Config";

class AudioFile {
    filename: string;
    extensions: Array<string> = ["OGG", "MP3"];
    dir: string;

    constructor(filename: string, dir: string) {
        this.filename = filename;
        this.dir = dir;
    }

    derivative(extension: string): string {
        // TODO
        const deriv = this.derivativePath(extension);
        // const command = ffmpeg();
        if (fs.existsSync(deriv)) {
            //     const dir = path.basename(deriv);
        }
        return "TODO";
    }

    static fromRaw(raw: Record<string, string>): AudioFile {
        return new AudioFile(raw.filename, raw.label);
    }

    raw(): Record<string, string> {
        return { filename: this.filename };
    }

    derivativePath(extension = "flac"): string {
        const filename = path.basename(this.filename);
        return this.dir + "/" + filename + "." + extension.toLowerCase();
    }
}

export default AudioFile;
