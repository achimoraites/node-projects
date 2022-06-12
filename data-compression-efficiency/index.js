import { createReadStream, createWriteStream, promises as fs } from "fs";
import { compressions } from "./utils/index.js";

const filenames = process.argv.slice(2);

(() => {
  for (const file of filenames) {
    compressFile(file, compressions);
  }
})();

async function compressFile(filename, compressions) {
  const original = await fs.stat(filename);
  for (const type of Object.keys(compressions)) {
    // compress data
    const compressionStream = createCompressStream(type, compressions);
    // write data (output)
    const outputStream = createOutputStream(filename, type, compressions);
    // create a new read stream for each file
    createReadStream(filename)
      .pipe(compressionStream)
      .pipe(outputStream)
      .on("finish", () => {
        printStats(getFile(filename, compressions, type), original);
      });
  }
}

function getFile(filename, compressions, type) {
  return `${filename}.${compressions[type].ext}`;
}

/**
 * Same as compressFile but forks one shared input (read) stream to all outputs
 * @param {string} filename
 * @param {*} compressions
 * @returns
 */
async function compressFileFork(filename, compressions) {
  const inputStream = createReadStream(filename);
  const original = await fs.stat(filename);

  // fork input stream to multiple outputs
  for (const type of Object.keys(compressions)) {
    // compress data
    const compressionStream = createCompressStream(type, compressions);
    // write data (output)
    const outputStream = createOutputStream(filename, type, compressions);
    // use the same input steam
    inputStream.pipe(compressionStream).pipe(outputStream);
  }

  inputStream.on("finish", () => {
    printStats(getFile(filename, compressions, type), original);
  });

  return inputStream;
}

function createOutputStream(filename, type, compressions) {
  const file = getFile(filename, compressions, type);
  return createWriteStream(file);
}

function createCompressStream(type, compressions) {
  const compression = compressions[type];
  const stream = compression.zlib();
  let timerIsRegistered = false;
  stream.on("data", () => {
    if (!timerIsRegistered) {
      console.time(type);
      timerIsRegistered = true;
    }
  });
  stream.on("end", () => console.timeEnd(type));

  return stream;
}

async function printStats(file, original) {
  const result = await fs.stat(file);
  const currSize = result.size;
  console.log("File:", file);
  console.log(
    "Size:",
    ` ${parseFloat((currSize / original.size) * 100).toFixed(
      2
    )}% of original size`
  );
  console.log("\n------------------------\n");
}
