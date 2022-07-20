export default [
  {
    input: "src/makeCacheable.js",
    output: [
      {
        file: "dist/makeCacheable.cjs",
        format: "cjs",
        exports: "default",
      },
      {
        file: "dist/makeCacheable.js",
        format: "es",
      },
    ],
  },
];
