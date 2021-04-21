import { constants } from "node:buffer";
import { stringify } from "node:querystring";
import Config from './Config';

class ImageFile {
    filename: string;
    sizes: Object = {
        "LARGE": 3000,
        "MEDIUM": 640,
        "THUMBNAIL": 120
    };

    constructor(filename) {
        this.filename = filename;
    }

    config() {
        let config = Config.getInstance();
        return config;
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
        return dir + "/" + filename + "/" + size + "/" + filename + "." + extension.toLowerCase();
    }

    ocr() {
        //TODO: update the following (derivativepath requires size now)
        var txt = this.derivativePath('OCR-DIRTY', 'txt'); 
        let fs = require('fs');
        var tesseract = require("node-tesseract-ocr");
        if (fs.existsSync(txt)){
            var path = this.basename(txt);
        }

    }

    ocrDerivative() {
        let fs = require("fs");
        let png = this.derivativePath('ocr/pngs', 'png');
        let { exec } = require("child_process");
        if (!fs.existsSync(png)) {
            let tc_cmd = this.config().textcleanerPath() + this.config().textcleanerSwitches() + this.derivative('LARGE') + png;
            exec(tc_cmd, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                } 
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                if (!fs.existsSync(png)) {
                    console.log ("Problem running textcleaner");
                }
                console.log(`stdout: ${stdout}`)
            });
        }
        return png;
    }

    ocrProperties() {
        let fs = require("fs");
        var path = require('path');
        let file = path.dirname(this.filename) + '/ocr/tesseract.config';
        let dir = path.dirname(file);
        let content = 'tessedit_char_whitelist ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:!\'"()&$%-+=[]?<>' + "\xE2\x80\x9C\xE2\x80\x9D\xE2\x80\x98\xE2\x80\x99";
        if (!fs.existsSync(file)) {
            fs.writeFile(dir + '/ocr/tesseract.config', content, err => {
                if (err) {
                  console.error(err)
                  return
                }
                //file written successfully
              })
        }
        return file;
    }

    public delete() {
        let fs = require("fs");
        if (fs.existsSync(this.filename)) {
            fs.unlinkSync(this.filename);
        }
        let files: Array<string> = [];
        for (let size in Object.keys(this.sizes)) {
            files.push(this.derivativePath(size, "jpg"));
            files.push(this.derivativePath('ocr/pngs', 'png'));
            files.push(this.derivativePath('OCR-DIRTY', 'txt'));
            if (fs.existsSync(files)) {
                try {
                    fs.unlinkSync(files);
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