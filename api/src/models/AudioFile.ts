import AudioOrder from './AudioOrder'
import Config from './Config';

class AudioFile {
    filename: string;
    extensions: Array<string> = ["OGG", "MP3"];
    dir: string;

    constructor(filename, dir) {
        this.filename = filename;
        this.dir = dir;
    }

     constraintForExtensions(extension) {
         if (this.extensions.includes(extension)) {
             return extension;
         } else {
             return 1;
         }
     }

     config() {
        const config = Config.getInstance();
        return config.restBaseUrl();
     }

     derivative(extension) {
         const deriv = this.derivativePath(extension);
         const fs = require('fs'), filename = deriv;
         const path = require('path');
         const ffmpeg = require('fluent-ffmpeg');
         var command = ffmpeg();
         if (fs.existsSync(filename)) {
             const dir = path.basename(filename);
             var command = ffmpeg()

         }

     }

     static fromRaw(raw) {
        return new raw['filename'], raw['label'];
    }

    raw() {
        return {filename: this.filename}
    }

     derivativePath(extension = "flac") {
         const filename = this.basename(this.filename);
         return this.dir + "/" + filename + "." + extension.toLowerCase();

     }

     basename(path) {
        return path.replace(/\/$/, "").split('/').reverse()[0];
     }
}

export default AudioFile;