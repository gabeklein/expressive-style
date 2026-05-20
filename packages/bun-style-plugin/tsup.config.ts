import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/cli.ts"],
  format: ["cjs", "esm"],
  target: "es2022",
  dts: { entry: "src/index.ts" },
  sourcemap: true,
});
