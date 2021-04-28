import fs = require("fs");
import Jimp = require("jimp");
import path = require("path");

import { exec } from "child_process";
// import { constants } from "node:buffer";
// import { stringify } from "node:querystring";

import Config from "./Config";
import PrivateConfig from "./PrivateConfig";

class ImageFile {
    filename: string;
    sizes: Record<string, number> = {
        LARGE: 3000,
        MEDIUM: 640,
        THUMBNAIL: 120,
    };

    constructor(filename: string) {
        this.filename = filename;
    }

    config(): PrivateConfig {
        const config = Config.getInstance();
        return config;
    }

    constraintForSize(size: string): number {
        if (size in this.sizes) {
            return this.sizes[size];
        } else {
            console.error("Invalid image size: " + size);
            return 1;
        }
    }

    async derivative(size: string): Promise<string> {
        const deriv = this.derivativePath(size);

        // Return existing derivative
        if (fs.existsSync(deriv)) {
            return deriv;
        }

        // Create derivative
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

    derivativePath(size: string, extension = "jpg"): string {
        const dir = path.dirname(this.filename);
        const ext = this.filename.substr(this.filename.lastIndexOf("."));
        const filename = path.basename(this.filename, ext);
        return dir + "/" + filename + "/" + size + "/" + filename + "." + extension.toLowerCase();
    }

    async ocr(): Promise<void> {
        //TODO: update the following (derivativepath requires size now)
        const txt = this.derivativePath("OCR-DIRTY", "txt");
        const deriv = await this.ocrDerivative();
        if (!fs.existsSync(txt)) {
            // const path = this.basename(txt);
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

    async ocrDerivative(): Promise<string> {
        const png = this.derivativePath("ocr/pngs", "png");
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

    ocrProperties(): string {
        const file = path.dirname(this.filename) + "/ocr/tesseract.config";
        // const dir = path.dirname(file);
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

    public delete(): void {
        const files: Array<string> = [this.filename];
        for (const size in Object.keys(this.sizes)) {
            files.push(this.derivativePath(size, "jpg"));
            files.push(this.derivativePath("ocr/pngs", "png"));
            files.push(this.derivativePath("OCR-DIRTY", "txt"));
        }
        for (const file of files) {
            if (fs.existsSync(file)) {
                try {
                    fs.unlinkSync(file);
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

    basename(path: string): string {
        return path.replace(/\/$/, "").split("/").reverse()[0];
    }
}

export default ImageFile;
