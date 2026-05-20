import { existsSync } from "node:fs";
import { join } from "node:path";

export interface Resolved {
  cwd: string;
  appPath: string;
  configPath?: string;
  htmlPath?: string;
}

export async function resolveProject(cwd: string): Promise<Resolved> {
  if (existsSync(join(cwd, "app")))
    throw new Error(
      "Found app/ directory: file-based routing requires @expressive/framework " +
        "(not implemented in @expressive/bun-dev). Use a single app.tsx for SPA mode.",
    );

  const rootApp = join(cwd, "app.tsx");
  const srcApp = join(cwd, "src", "app.tsx");
  const rootHas = existsSync(rootApp);
  const srcHas = existsSync(srcApp);

  if (rootHas && srcHas)
    throw new Error("Found both ./app.tsx and ./src/app.tsx - pick one.");

  if (!rootHas && !srcHas)
    throw new Error("Missing app.tsx at project root or under src/.");

  const appPath = rootHas ? rootApp : srcApp;

  const indexTs = join(cwd, "index.ts");
  const configPath = existsSync(indexTs) ? indexTs : undefined;

  const indexHtml = join(cwd, "index.html");
  const htmlPath = existsSync(indexHtml) ? indexHtml : undefined;

  return { cwd, appPath, configPath, htmlPath };
}
