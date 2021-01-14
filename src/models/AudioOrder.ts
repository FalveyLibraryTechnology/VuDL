import AudioFile from './AudioFile'

class AudioOrder {
    list: Array<object> = [];

    constructor(list) {
        this.list = list;
    }

    static fromJob(job) {
        var glob = require("glob");
        var list = glob.sync(job.dir + ".flac").map(function(flac: string){ return new AudioFile(this.basename(flac), job.dir)});
        return new AudioOrder(list);

    }

    static fromRaw(raw) {
        var list = raw.map(function(list: string){ return AudioFile.fromRaw(list) });
        return new AudioOrder(list);

    }

    raw() {
        return this.list.map(function(audiofile: AudioFile) { return audiofile.raw() });
    }

    basename(path) {
        return path.split('/').reverse()[0];
     }

}

export default AudioOrder;