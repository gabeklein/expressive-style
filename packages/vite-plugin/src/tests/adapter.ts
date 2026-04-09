import { transform } from "@babel/core";
import { dirname, relative, resolve } from "path";
import { format } from "prettier";
import { build, Plugin } from "vite";
import { expect } from "vitest";

import MyPlugin, { Options } from "..";

interface BuildOutput {
  [name: string]: string;
}

const BUILD_OUTPUT = new WeakSet<BuildOutput>();

expect.addSnapshotSerializer({
  test: (x) => BUILD_OUTPUT.has(x),
  print: (output: any) => {
    return Object.entries(output)
      .map(([key, value]) => {
        return `/** ${key} **/\n${value}`;
      })
      .join("\n");
  },
});

export async function bundle(input: Record<string, string> | string = "", options: Options = {}) {
  const output: Record<string, string> = {};

  BUILD_OUTPUT.add(output);

  await build({
    logLevel: "silent",
    build: {
      rollupOptions: {
        external: /polyfill/,
      },
    },
    plugins: [VirtualFiles(input, output), MyPlugin(options)],
  });

  for (const key in output)
    if (key.endsWith(".css"))
      output[key] = await format(output[key], { parser: "css" });

  return output;
}

const TEST_HTML = `
  <html lang="en">
    <body>
      <script type="module" src="./index.jsx"></script>
    </body>
  </html>
`;

function VirtualFiles(
  input: Record<string, string> | string,
  output: Record<string, string>
) {
  const source =
    typeof input === "string"
      ? {
          "index.jsx": input,
          "index.html": TEST_HTML,
        }
      : input;

  const resolved = new Map<string, string>();

  return <Plugin>{
    enforce: "pre",
    name: "virtual-files-plugin",
    config: () => ({
      root: __dirname,
      build: {
        write: false,
      },
    }),
    resolveId(id, requester) {
      const absolute = requester
        ? resolve(dirname(requester), id)
        : resolve(__dirname, id);

      const path = relative(__dirname, absolute);

      if (path in source) {
        resolved.set(absolute, source[path]);
        return absolute;
      }
    },
    load(id) {
      return resolved.get(id);
    },
    generateBundle(_, bundle: any) {
      for (const key in bundle) {
        const file = bundle[key] as any;
        const name = file.fileName;

        if (file.type === "asset") output[name] = file.source;
        else {
          const result = transform(file.code, { comments: false });
          output[name] = result ? result.code! : file.code;
        }
      }
    },
  };
}
