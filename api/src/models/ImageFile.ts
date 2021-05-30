import Jimp = require("jimp");
import path = require("path");

import { execSync } from "child_process";

import Config from "./Config";

import fs = require("fs");

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

    async ocr(): Promise<string> {
        const txt = this.derivativePath("OCR-DIRTY", "txt");
        if (!fs.existsSync(txt)) {
            const txtPath = path.dirname(txt);
            if (!fs.existsSync(txtPath)) {
                fs.mkdirSync(txtPath, { recursive: true });
            }
            const deriv = await this.ocrDerivative();
            const config = Config.getInstance();
            const ts_cmd = config.tesseractPath + " " + deriv + " " + txt.slice(0, -4) + " " + this.ocrProperties();
            execSync(ts_cmd);
            if (!fs.existsSync(txt)) {
                throw "Problem running tesseract";
            }
        }
        return txt;
    }

    async ocrDerivative(): Promise<string> {
        const png = this.derivativePath("ocr/pngs", "png");
        if (!fs.existsSync(png)) {
            const pngPath = path.dirname(png);
            if (!fs.existsSync(pngPath)) {
                fs.mkdirSync(pngPath, { recursive: true });
            }
            const config = Config.getInstance();
            const deriv = await this.derivative("LARGE");
            const tc_cmd = config.textcleanerPath + " " + config.textcleanerSwitches + " " + deriv + " " + png;
            execSync(tc_cmd);
            if (!fs.existsSync(png)) {
                throw "Problem running textcleaner";
            }
        }
        return png;
    }

    ocrProperties(): string {
        const file = path.dirname(this.filename) + "/ocr/tesseract.config";
        const dir = path.dirname(file);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const content =
            "tessedit_char_whitelist ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:!'\"()&$%-+=[]?<>" +
            "\xE2\x80\x9C\xE2\x80\x9D\xE2\x80\x98\xE2\x80\x99";
        if (!fs.existsSync(file)) {
            fs.writeFile(file, content, (err) => {
                if (err) {
                    throw err;
                }
                // file written successfully
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
