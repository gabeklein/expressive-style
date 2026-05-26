import { expressiveJSX } from "@expressive/bun-style-plugin";

import { writeScaffold } from "./scaffold";

export async function runBuild(cwd = process.cwd()): Promise<void> {
  const { htmlPath } = writeScaffold(cwd);

  const result = await Bun.build({
    entrypoints: [htmlPath],
    outdir: "./dist",
    target: "browser",
    minify: true,
    sourcemap: "linked",
    plugins: [expressiveJSX()],
  });

  for (const log of result.logs) console.error(log);
  if (!result.success) process.exit(1);
  for (const output of result.outputs) console.log(output.path);
}
