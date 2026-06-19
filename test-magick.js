import { initializeImageMagick, MagickImage, MagickFormat } from '@imagemagick/magick-wasm';

(async () => {
    try {
        await initializeImageMagick();
        console.log("ImageMagick initialized");
    } catch (e) {
        console.error(e);
    }
})();
