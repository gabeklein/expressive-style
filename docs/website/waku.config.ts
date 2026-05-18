import stylePlugin from "@expressive/vite-plugin";
import { type Config, defineConfig } from "waku/config";
import mdx from "fumadocs-mdx/vite";
import * as MdxConfig from "./source.config.js";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import type { Plugin, UserConfig } from "vite";
import { cp, readFile } from "fs/promises";
import { fileURLToPath } from "url";
import type { IncomingMessage, ServerResponse } from "http";
import { join, resolve } from "path";

export default defineConfig({
  vite: {
    optimizeDeps: {
      exclude: ["fumadocs-ui", "fumadocs-core", "@fumadocs/ui"],
    },
    plugins: [
      stylePlugin(),
      tailwindcss(),
      mdx(MdxConfig),
      tsconfigPaths(),
      serveSkills(),
    ],
  } satisfies UserConfig as Config["vite"],
});

function serveSkills(): Plugin {
  const currentDir = fileURLToPath(new URL(".", import.meta.url));
  const dir = resolve(currentDir, "../../skills");

  return {
    name: "serve-llm",
    configureServer(server) {
      const handle = async (req: IncomingMessage, res: ServerResponse) => {
        try {
          const file = join(dir, req.url || "/");
          const content = await readFile(file);
          res.setHeader("Content-Type", "text/plain");
          res.end(content);
        } catch {
          res.statusCode = 404;
          res.end("Not found");
        }
      };

      server.middlewares.use("/llm", handle);
      server.middlewares.use("/llms", handle);
    },
    async writeBundle({ dir: outDir }) {
      if (outDir) {
        await cp(dir, join(outDir, "llm"), { recursive: true });
        await cp(dir, join(outDir, "llms"), { recursive: true });
      }
    },
  };
}
