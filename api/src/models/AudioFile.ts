// import ffmpeg = require("fluent-ffmpeg");
import fs = require("fs");
import path = require("path");

import Config from "./Config";

class AudioFile {
    filename: string;
    extensions: Array<string> = ["OGG", "MP3"];
    dir: string;

    constructor(filename: string, dir: string) {
        this.filename = filename;
        this.dir = dir;
    }

    constraintForExtensions(extension: string): string | number {
        if (this.extensions.includes(extension)) {
            return extension;
        } else {
            return 1; // TODO
        }
    }

    config(): string {
        const config = Config.getInstance();
        return config.restBaseUrl();
    }

    derivative(extension: string): void {
        // TODO
        const deriv = this.derivativePath(extension);
        // const command = ffmpeg();
        if (fs.existsSync(deriv)) {
            //     const dir = path.basename(deriv);
        }
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
