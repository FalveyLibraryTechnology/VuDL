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
        let config = Config.getInstance();
        return config.restBaseUrl();
     }

     derivative(extension) {
         var deriv = this.derivativePath(extension);
         let fs = require('fs'), filename = deriv;
         var path = require('path');
         var ffmpeg = require('fluent-ffmpeg');
         var command = ffmpeg();
         if (fs.existsSync(filename)) {
             var dir = path.basename(filename);
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
         var filename = this.basename(this.filename);
         return this.dir + "/" + filename + "." + extension.toLowerCase();

     }

     basename(path) {
        return path.replace(/\/$/, "").split('/').reverse()[0];
     }
}

export default AudioFile;