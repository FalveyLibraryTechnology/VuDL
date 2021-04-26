import { constants } from "node:buffer";
import { stringify } from "node:querystring";
import Config from "./Config";

class ImageFile {
    filename: string;
    sizes: Object = {
        LARGE: 3000,
        MEDIUM: 640,
        THUMBNAIL: 120,
    };

    constructor(filename) {
        this.filename = filename;
    }

    config() {
        const config = Config.getInstance();
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
        const deriv = this.derivativePath(size);

        // Return existing derivative
        const fs = require("fs");
        if (fs.existsSync(deriv)) {
            return deriv;
        }

        // Create derivative
        const Jimp = require("jimp");
        const image = await Jimp.read(this.filename);
        const constraint = this.constraintForSize(size);

        if (image.bitmap.width > constraint || image.bitmap.height > constraint) {
            try {
                console.log("make derivative", constraint, deriv);
                image.scaleToFit(constraint, constraint); // resize to pixel sizes?
                image.quality(90); // set JPEG quality
                await image.writeAsync(deriv); // save
            } catch (error) {
                console.error("resize error: " + error);
            }
        } else {
            // Image source smaller than derivative size
            await image.writeAsync(deriv); // save
        }
        return deriv;
    }

    derivativePath(size, extension = "jpg") {
        const path = require("path");
        const dir = path.dirname(this.filename);
        const filename = this.basename(this.filename);
        return dir + "/" + filename + "/" + size + "/" + filename + "." + extension.toLowerCase();
    }

    async ocr() {
        //TODO: update the following (derivativepath requires size now)
        const txt = this.derivativePath("OCR-DIRTY", "txt");
        const fs = require("fs");
        const { exec } = require("child_process");
        const deriv = await this.ocrDerivative();
        if (!fs.existsSync(txt)) {
            const path = this.basename(txt);
            const ts_cmd =
                this.config().tesseractPath() + " " + deriv + " " + txt.slice(0, -4) + " " + this.ocrProperties();
            exec(ts_cmd, (error, stdout, stderr) => {
                if (error) {
                    throw `error: ${error.message + " " + stderr}`;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                }
                if (!fs.existsSync(txt)) {
                    throw "Problem running tesseract";
                }
                console.log(`stdout: ${stdout}`);
            });
        }
    }

    async ocrDerivative() {
        const fs = require("fs");
        const png = this.derivativePath("ocr/pngs", "png");
        const { exec } = require("child_process");
        const deriv = await this.derivative("LARGE");
        if (!fs.existsSync(png)) {
            const tc_cmd =
                this.config().textcleanerPath() + " " + this.config().textcleanerSwitches() + " " + deriv + " " + png;
            exec(tc_cmd, (error, stdout, stderr) => {
                if (error) {
                    throw `error: ${error.message + " " + stderr}`;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                }
                if (!fs.existsSync(png)) {
                    throw "Problem running textcleaner";
                }
                console.log(`stdout: ${stdout}`);
            });
        }
        return png;
    }

    ocrProperties() {
        const fs = require("fs");
        const path = require("path");
        const file = path.dirname(this.filename) + "/ocr/tesseract.config";
        const dir = path.dirname(file);
        const content =
            "tessedit_char_whitelist ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:!'\"()&$%-+=[]?<>" +
            "\xE2\x80\x9C\xE2\x80\x9D\xE2\x80\x98\xE2\x80\x99";
        if (!fs.existsSync(file)) {
            fs.writeFile(file, content, (err) => {
                if (err) {
                    throw err;
                }
                //file written successfully
            });
        }
        return file;
    }

    public delete() {
        const fs = require("fs");
        if (fs.existsSync(this.filename)) {
            fs.unlinkSync(this.filename);
        }
        const files: Array<string> = [];
        for (const size in Object.keys(this.sizes)) {
            files.push(this.derivativePath(size, "jpg"));
            files.push(this.derivativePath("ocr/pngs", "png"));
            files.push(this.derivativePath("OCR-DIRTY", "txt"));
            if (fs.existsSync(files)) {
                try {
                    fs.unlinkSync(files);
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

    basename(path) {
        return path.replace(/\/$/, "").split("/").reverse()[0];
    }
}

export default ImageFile;
