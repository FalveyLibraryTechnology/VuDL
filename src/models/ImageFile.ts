class ImageFile {
    filename: string;
    sizes: Array<string> = ["LARGE", "MEDIUM", "THUMBNAIL"];

    constructor(filename) {
        this.filename = filename;
    }

    constraintForSize(size) {
        if (this.sizes.includes(size)) {
            return size;
        } else {
            return 1;
        }
    }

    derivative(size) {
        var deriv = this.derivativePath(size);
        let fs = require('fs'), filename = deriv;
        var path = require('path');

         if (fs.existsSync(filename)) {
             var dir = path.basename(filename);
         }
     }

    derivativePath(size, extension = "jpg") {
        var path = require('path');
        var dir = path.basename(filename);
        var filename = this.basename(this.filename);
        return dir + "/" + filename + "." + extension.toLowerCase();
    }

    ocr() {

    }

    ocrDerivative() {

    }

    ocrProperties() {

    }

    delete() {

    }

    basename(path) {
        return path.split('/').reverse()[0];
     }
}

export default ImageFile;