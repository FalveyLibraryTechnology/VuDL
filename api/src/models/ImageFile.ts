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
        var Jimp = require('jimp');
        var image = Jimp.read(this.filename);
        var constraint = this.constraintForSize(size);

        if (image.columns > constraint || image.rows > constraint) {
            try {
                image.resize(256, 256); // resize
                image.quality(60); // set JPEG quality
                image.greyscale(); // set greyscale
                image.write(deriv); // save
            } catch (error) {
                console.error(error);
            };
            return deriv;
        }
     }

    derivativePath(size, extension = "jpg") {
        var path = require('path');
        var dir = path.basename(filename);
        var filename = this.basename(this.filename);
        return dir + "/" + filename + "." + extension.toLowerCase();
    }

    ocr() {
        var txt = this.derivativePath('OCR-DIRTY', 'txt');
        let fs = require('fs');
        var tesseract = require("node-tesseract-ocr");
        if (fs.existsSync(txt)){
            var path = this.basename(txt);
        }

    }

    ocrDerivative() {

    }

    ocrProperties() {

    }

    delete() {

    }

    basename(path) {
        return path.replace(/\/$/, "").split('/').reverse()[0];
     }
}

export default ImageFile;