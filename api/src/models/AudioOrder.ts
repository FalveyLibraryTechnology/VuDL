import glob = require("glob");
import path = require("path");

import AudioFile from "./AudioFile";
import Job from "./Job";

class AudioOrder {
    list: Array<AudioFile> = [];

    constructor(list: Array<AudioFile>) {
        this.list = list;
    }

    static fromJob(job: Job): AudioOrder {
        let pattern = job.dir + "/*.flac";
        const options: Record<string, unknown> = { nocase: true };
        // Special case for Windows -- we need to account for drive letters:
        const colonIndex = pattern.indexOf(":");
        if (colonIndex > -1) {
            options.root = pattern.substring(0, colonIndex + 2);
            pattern = pattern.substring(colonIndex + 1);
        }
        const list = glob.sync(pattern, options).map(function (flac: string) {
            return new AudioFile(path.basename(flac), job.dir);
        });
        return new AudioOrder(list);
    }

    static fromRaw(raw: Array<Record<string, string>>): AudioOrder {
        const list = raw.map(function (list) {
            return AudioFile.fromRaw(list);
        });
        return new AudioOrder(list);
    }

    raw(): Array<Record<string, string>> {
        return this.list.map(function (audiofile: AudioFile) {
            return audiofile.raw();
        });
    }
}

export default AudioOrder;
