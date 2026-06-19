import mupdf from "mupdf";

(async () => {
    try {
        console.log("mupdf loaded", mupdf);
    } catch (e) {
        console.error(e);
    }
})();
