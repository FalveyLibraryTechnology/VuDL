// Work around for a flaw in @types/pdfkit, which omits `openImage()` from the type definitions.
// even though pdfkit implements and exports it (lib/mixins/images.js).

declare namespace PDFKit.Mixins {
    interface OpenedImage {
        width: number;
        height: number;
    }

    interface PDFImage {
        openImage(src: string | Buffer): OpenedImage;
        image(src: OpenedImage, x?: number, y?: number, options?: ImageOption): this;
        image(src: OpenedImage, options?: ImageOption): this;
    }
}
