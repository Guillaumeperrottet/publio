const pdfFonts = require("pdfmake/build/vfs_fonts");

console.log("Type of pdfFonts:", typeof pdfFonts);
console.log("pdfFonts keys:", Object.keys(pdfFonts));
console.log("Has vfs:", "vfs" in pdfFonts);
console.log("Has pdfMake:", "pdfMake" in pdfFonts);

if (pdfFonts.pdfMake) {
  console.log("pdfMake keys:", Object.keys(pdfFonts.pdfMake));
  console.log("Has pdfMake.vfs:", "vfs" in pdfFonts.pdfMake);
}

if (pdfFonts.vfs) {
  console.log("vfs keys (first 5):", Object.keys(pdfFonts.vfs).slice(0, 5));
  console.log("Has Roboto-Regular.ttf:", "Roboto-Regular.ttf" in pdfFonts.vfs);
} else if (pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
  console.log(
    "pdfMake.vfs keys (first 5):",
    Object.keys(pdfFonts.pdfMake.vfs).slice(0, 5)
  );
  console.log(
    "Has Roboto-Regular.ttf:",
    "Roboto-Regular.ttf" in pdfFonts.pdfMake.vfs
  );
}
