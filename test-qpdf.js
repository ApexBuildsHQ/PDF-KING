import createModule from "@neslinesli93/qpdf-wasm";

(async () => {
    const qpdf = await createModule();
    console.log(qpdf.callMain(["--empty", "--flatten-annotations=all", "--generate-appearances", "out.pdf"]));
})();
