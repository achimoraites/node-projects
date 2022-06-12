import { createGzip, createBrotliCompress, createDeflate } from "zlib";

export const compressions = {
  gzip: {
    zlib: createGzip,
    ext: "gz",
  },
  brotli: {
    zlib: createBrotliCompress,
    ext: "br",
  },
  deflate: {
    zlib: createDeflate,
    ext: "zz",
  },
};
