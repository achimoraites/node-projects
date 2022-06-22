import { compressions } from "./utils/index.js";
import FileCompressorStreamBuilder from "./utils/FileCompressorStreamBuilder.js";

const filenames = process.argv.slice(2);

(() => {
  console.log("\n------------------------\n");
  for (const file of filenames) {
    compressFile(file, compressions);
  }
})();

function compressFile(filename, compressions) {
  for (const type of Object.keys(compressions)) {
    new FileCompressorStreamBuilder(type)
      .setFilename(filename)
      .setCompression(compressions[type])
      .setPrintStats(true)
      .build();
  }
}
