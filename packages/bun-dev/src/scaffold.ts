import { createRequire } from "node:module";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { Resolved } from "./resolve";

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

export function writeScaffold(resolved: Resolved): Scaffold {
  const dir = join(resolved.cwd, "node_modules", ".expressive");
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
  const require = createRequire(import.meta.url);
  const stylePlugin = require.resolve("@expressive/bun-style-plugin");
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
