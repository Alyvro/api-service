import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./main/index.ts", "./main/plugins.ts", "./main/types.ts"],
  format: ["esm"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  shims: true,
  silent: true,
  cjsInterop: true,
  metafile: true,
  globalName: "Blast",
  legacyOutput: true,
  keepNames: false,
  platform: "node",
  minifyIdentifiers: true,
  minifySyntax: true,
  minifyWhitespace: true,
  minify: true,
  outDir: "dist",
  external: ["express"],
});
