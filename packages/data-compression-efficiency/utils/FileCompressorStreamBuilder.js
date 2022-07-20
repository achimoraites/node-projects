import { createReadStream, createWriteStream, promises as fs } from "fs";
export default class FileCompressorStreamBuilder {
  #compression = null;
  #label = null;
  #lastTime = null;
  #totalTime = null;
  #filename = null;
  #print = false;
  constructor(label) {
    this.#label = label;
  }
  setCompression(compression) {
    this.#compression = compression;
    return this;
  }
  setFilename(filename) {
    this.#filename = filename;
    return this;
  }
  setPrintStats(print) {
    this.#print = print;
    return this;
  }
  build() {
    try {
      // compress data
      const compressionStream = this.#createCompressStream();
      compressionStream.on("pipe", () => (this.#lastTime = process.hrtime()));
      // write data (output)
      const outputStream = this.#createOutputStream();
      // create a new read stream for each file
      const stream = createReadStream(this.#filename)
        .pipe(compressionStream)
        .pipe(outputStream);
      stream.on("finish", async () => {
        this.#totalTime = process.hrtime(this.#lastTime);
        if (this.#print) {
          await this.#printStats();
        }
      });
      return stream;
    } catch (error) {
      console.error(error);
    }
  }

  getOutputFilePath() {
    return `${this.#filename}.${this.#compression.ext}`;
  }

  async #printStats() {
    const [result, original] = await Promise.all([
      fs.stat(this.getOutputFilePath()),
      fs.stat(this.#filename),
    ]);

    console.log("Compression:", this.#label);
    console.log("File:", this.getOutputFilePath());
    console.log(
      `Timer: ${this.#totalTime[0]} seconds ` +
        `and ${this.#totalTime[1] / 1000000} miliseconds.`
    );
    console.log(
      "Size:",
      ` ${parseFloat((result.size / original.size) * 100).toFixed(
        2
      )}% of original size`
    );
    console.log("\n------------------------\n");
  }

  #createOutputStream() {
    const file = this.getOutputFilePath();
    return createWriteStream(file);
  }

  #createCompressStream() {
    return this.#compression.zlib();
  }
}
