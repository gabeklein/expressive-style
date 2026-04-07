import { mkdtempSync, writeFileSync, realpathSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createServer, ViteDevServer } from "vite";
import Plugin from "..";

const COMPONENT_BASIC = `
export const Hello = () => {
  color: red;
  return <div>Hello!</div>;
};
`;

const COMPONENT_CSS_ONLY = `
export const Hello = () => {
  color: blue;
  return <div>Hello!</div>;
};
`;

const COMPONENT_BOTH = `
export const Hello = () => {
  color: blue;
  return <div>Changed!</div>;
};
`;

describe("HMR", () => {
  let server: ViteDevServer;
  let root: string;
  let filePath: string;

  beforeEach(async () => {
    root = realpathSync(mkdtempSync(join(tmpdir(), "vite-hmr-")));
    filePath = join(root, "Hello.jsx");

    writeFileSync(filePath, COMPONENT_BASIC);
    writeFileSync(
      join(root, "index.html"),
      `<html><body><script type="module" src="./Hello.jsx"></script></body></html>`
    );

    server = await createServer({
      root,
      logLevel: "silent",
      server: { middlewareMode: true },
      plugins: [Plugin()],
    });

    await server.transformRequest("/Hello.jsx");
  });

  afterEach(async () => {
    await server.close();
  });

  async function triggerHMR(content: string) {
    writeFileSync(filePath, content);

    const modules = server.moduleGraph.getModulesByFile(filePath);
    if (!modules?.size) throw new Error("No modules found for component");

    const plugin = server.config.plugins.find(
      (p) => p.name === "expressive-jsx-plugin"
    );

    const hook = plugin?.handleHotUpdate;
    const handler =
      typeof hook === "function" ? hook : (hook as any)?.handler;

    if (!handler) throw new Error("handleHotUpdate hook not found");

    return (
      (await handler.call({}, {
        file: filePath,
        timestamp: Date.now(),
        modules: [...modules],
        read: () => Promise.resolve(content),
        server,
      })) ?? []
    );
  }

  it("fires HMR with CSS module invalidated", async () => {
    const updated = await triggerHMR(COMPONENT_CSS_ONLY);
    const ids = updated.map((m: any) => m.id ?? m.url);

    expect(ids.some((id: string) => id.includes(".css"))).toBe(true);
  });

  it("squashes JS update for style-only change", async () => {
    const updated = await triggerHMR(COMPONENT_CSS_ONLY);
    const ids = updated.map((m: any) => m.id ?? m.url);

    expect(ids.some((id: string) => id.includes(".css"))).toBe(true);
    expect(ids.some((id: string) => id.endsWith(".jsx"))).toBe(false);
  });

  it("updates both JS and CSS when both change", async () => {
    const updated = await triggerHMR(COMPONENT_BOTH);
    const ids = updated.map((m: any) => m.id ?? m.url);

    expect(ids.some((id: string) => id.endsWith(".jsx"))).toBe(true);
    expect(ids.some((id: string) => id.includes(".css"))).toBe(true);
  });
});
