import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SHELL = `\
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.tsx"></script>
  </body>
</html>
`;

export interface Scaffold {
  dir: string;
  htmlPath: string;
  servePath: string;
  bunfigPath: string;
}

export function writeScaffold(cwd: string): Scaffold {
  const resolved = resolveProject(cwd);
  const dir = join(cwd, "node_modules", ".expressive");
  mkdirSync(dir, { recursive: true });

  const htmlPath = join(dir, "index.html");
  const mainPath = join(dir, "main.tsx");
  const servePath = join(dir, "serve.ts");
  const bunfigPath = join(dir, "bunfig.toml");

  const html = resolved.htmlPath
    ? ensureBootstrap(readFileSync(resolved.htmlPath, "utf8"))
    : SHELL;
  writeFileSync(htmlPath, html);
  writeFileSync(mainPath, bootstrap(resolved.appPath));
  writeFileSync(servePath, serveEntry(resolved.configPath));
  writeFileSync(bunfigPath, bunfig());

  return { dir, htmlPath, servePath, bunfigPath };
}

const bootstrap = (appPath: string) => `\
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from ${JSON.stringify(appPath)};

const el = document.getElementById("root");
if (!el) throw new Error("Missing #root element");
createRoot(el).render(<StrictMode><App /></StrictMode>);
`;

const serveEntry = (configPath?: string) => `\
import index from "./index.html";
${
  configPath
    ? `import userConfig from ${JSON.stringify(configPath)};`
    : `const userConfig = {};`
}

const config: any = userConfig ?? {};

const server = Bun.serve({
  port: config.port ?? 3000,
  ...config,
  routes: { ...(config.routes ?? {}), "/*": index },
  development: { hmr: true, console: true },
});

console.log(\`Expressive Dev running at \${server.url}\`);
`;

function bunfig(): string {
  const stylePlugin = fileURLToPath(import.meta.resolve("@expressive/bun-style-plugin"));
  return `[serve.static]\nplugins = [${JSON.stringify(stylePlugin)}]\n`;
}

function ensureBootstrap(html: string): string {
  let out = html;

  if (!/id=["']root["']/.test(out)) {
    const mount = `<div id="root"></div>`;
    out = out.includes("</body>")
      ? out.replace("</body>", `  ${mount}\n  </body>`)
      : out + "\n" + mount + "\n";
  }

  if (!out.includes("./main.tsx")) {
    const tag = `<script type="module" src="./main.tsx"></script>`;
    out = out.includes("</body>")
      ? out.replace("</body>", `  ${tag}\n  </body>`)
      : out + "\n" + tag + "\n";
  }

  return out;
}

function resolveProject(cwd: string) {
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

  const indexTs = join(cwd, "index.ts");
  const indexHtml = join(cwd, "index.html");

  return {
    appPath: rootHas ? rootApp : srcApp,
    configPath: existsSync(indexTs) ? indexTs : undefined,
    htmlPath: existsSync(indexHtml) ? indexHtml : undefined,
  };
}
