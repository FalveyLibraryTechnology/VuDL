import fs = require("fs");
import path = require("path");
import Config from "./Config";
import { execSync } from "child_process";

class AudioFile {
    filename: string;
    extensions: Array<string> = ["OGG", "MP3"];
    dir: string;

    constructor(filename: string, dir: string) {
        this.filename = filename;
        this.dir = dir;
    }

    ffmpeg(): string {
        const ffmpeg_path = Config.getInstance().ffmpegPath;
        return ffmpeg_path;
    }

    derivative(extension: string): string {
        const deriv = this.derivativePath(extension);
        if (!fs.existsSync(deriv)) {
            const dir = path.dirname(deriv);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            if (this.extensions.includes(extension)) {
                if (fs.existsSync(this.ffmpeg())) {
                    const ffmpegCommand = this.ffmpeg() + " -i " + this.dir + "/" + this.filename + " " + deriv;
                    try {
                        execSync(ffmpegCommand);
                    } catch (e) {
                        console.log(e);
                    }
                }
            }
        }
        return deriv;
    }

    static fromRaw(raw: Record<string, string>): AudioFile {
        return new AudioFile(raw.filename, raw.label);
    }

    raw(): Record<string, string> {
        return { filename: this.filename };
    }

    derivativePath(extension = "flac"): string {
        const filename = path.basename(this.filename, ".*");
        return this.dir + "/" + filename + "." + extension.toLowerCase();
    }
}

export default AudioFile;
