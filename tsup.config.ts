import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/server.ts"],
	// Change this line to compile ONLY for ESM modules
	format: ["esm"],
	splitting: false,
	sourcemap: true,
	clean: true,
	minify: true,
	target: "esnext",
	outDir: "dist",

	bundle: true,

	// Add banner to shim require() for CJS dependencies in ESM context
	banner: {
		js: `
      import { createRequire } from 'module';
      const require = createRequire(import.meta.url);
    `,
	},
});
