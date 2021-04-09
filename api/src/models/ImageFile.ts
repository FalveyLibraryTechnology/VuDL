import { constants } from "node:buffer";
import { stringify } from "node:querystring";

class ImageFile {
    filename: string;
    sizes: Object = {
        "LARGE": 3000,
        "MEDIUM": 640,
        "THUMBNAIL": 120
    };
    sizeArray: Array<string> = ["LARGE","MEDIUM","THUMBNAIL"];

    constructor(filename) {
        this.filename = filename;
    }

    constraintForSize(size) {
        if (size in this.sizes) {
            return this.sizes[size];
        } else {
            console.error("Invalid image size: " + size);
            return 1;
        }
    }

    async derivative(size) {
        let deriv = this.derivativePath(size);

        // Return existing derivative
        let fs = require("fs");
        if (fs.existsSync(deriv)) {
            return deriv;
        }

        // Create derivative
        let Jimp = require('jimp');
        let image = await Jimp.read(this.filename);
        let constraint = this.constraintForSize(size);

        if (image.bitmap.width > constraint || image.bitmap.height > constraint) {
            try {
                console.log("make derivative", constraint, deriv);
                image.scaleToFit(constraint, constraint); // resize to pixel sizes?
                image.quality(90); // set JPEG quality
                await image.writeAsync(deriv); // save
            } catch (error) {
                console.error("resize error: " + error);
            };
        } else {
            // Image source smaller than derivative size
            await image.writeAsync(deriv); // save
        }
        return deriv;
     }

    derivativePath(size, extension = "jpg") {
        var path = require('path');
        var dir = path.dirname(this.filename);
        var filename = this.basename(this.filename);
        return dir + "/" + filename + "." + size + "." + extension.toLowerCase();
    }

    ocr() {
        //TO DO: update the following (derivativepath requires size now)
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

    public delete() {
        let fs = require("fs");
        for (let size in this.sizeArray) {
            let path = this.derivativePath(size, "jpg");
            if (fs.existsSync(path)) {
                try {
                    fs.unlinkSync(path);
                } catch(err) {
                    console.error(err);
                }
            }
        };
    }

    basename(path) {
        return path.replace(/\/$/, "").split('/').reverse()[0];
    }
}

export default ImageFile;