import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, dirname } from "node:path";

import type { Resolved } from "./resolve";

const HTML = `\
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

const bootstrap = (appImport: string) => `\
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from ${JSON.stringify(appImport)};

const el = document.getElementById("root");
if (!el) throw new Error("Missing #root element");
createRoot(el).render(<StrictMode><App /></StrictMode>);
`

const entry = (userImoort: string, port: number) => `\
import index from "./index.html";
${userImoort}

const server = Bun.serve({
  port: ${port},
  ...userConfig,
  routes: { ...(userConfig.routes ?? {}), "/*": index },
  development: { hmr: true, console: true },
});

console.log(\`Expressive Dev running at \${server.url}\`);
`

export interface Scaffold {
  dir: string;
  htmlPath: string;
  mainPath: string;
  servePath: string;
}

export function writeScaffold(resolved: Resolved, port: number): Scaffold {
  const dir = join(resolved.cwd, ".expressive");
  mkdirSync(dir, { recursive: true });

  const htmlPath = join(dir, "index.html");
  const mainPath = join(dir, "main.tsx");
  const servePath = join(dir, "serve.ts");

  const appImport = "./" + relative(dirname(mainPath), resolved.appPath).replace(/\\/g, "/");
  const configImport = resolved.configPath
    ? "./" + relative(dirname(servePath), resolved.configPath).replace(/\\/g, "/")
    : null;
  const html = resolved.htmlPath
    ? ensureBootstrap(readFileSync(resolved.htmlPath, "utf8"))
    : HTML;

  writeFileSync(htmlPath, html);
  writeFileSync(mainPath, bootstrap(appImport));
  writeFileSync(servePath, serveEntry(configImport, port));

  return { dir, htmlPath, mainPath, servePath };
}

function serveEntry(configImport: string | null, port: number): string {
  const userConfig = configImport
    ? `import userConfig from ${JSON.stringify(configImport)};`
    : `const userConfig = {};`;

  return entry(userConfig, port);
}

function ensureBootstrap(html: string): string {
  if (html.includes("./main.tsx") || html.includes("/main.tsx")) return html;
  const tag = `<script type="module" src="./main.tsx"></script>`;
  if (html.includes("</body>")) return html.replace("</body>", `  ${tag}\n  </body>`);
  return html + "\n" + tag + "\n";
}
