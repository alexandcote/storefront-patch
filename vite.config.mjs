import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  mode,
  build: {
    emptyOutDir: true,
    target: "es2018",
    minify: "terser",
    terserOptions: {
      toplevel: true,
      ecma: 2020,
      mangle: mode !== "development" && {
        properties: {
          regex: /^_/,
        },
      },
      compress: mode !== "development" && {
        passes: 10,
        unsafe: true,
      },
    },
    rollupOptions: {
      output: {
        generatedCode: {
          preset: "es2015",
          symbols: false,
        },
        externalLiveBindings: false,
        minifyInternalExports: true,
        freeze: false,
        strict: false,
        compact: true,
      },
    },
    sourcemap: mode === "development",
    lib: {
      entry: new URL("./src/index.ts", import.meta.url).pathname,
      formats: ["iife"],
      name: "storefront",
      fileName: () => "storefront.js",
    },
  },
  test: {
    coverage: {
      provider: "istanbul",
    },
    setupFiles: ["./tests/setup.ts"],
    testTimeout: process.env.BROWSER === "firefox" ? 50000 : 5000,
  },
}));
