import { transformAsync } from "@babel/core";
import { format } from "prettier";
import { expect } from "vitest";

import { Plugin } from "..";

// drop quotes from string snapshot
expect.addSnapshotSerializer({
  test: (x) => typeof x == "string",
  print: (output) => output as string,
});

export type Output = { code: string };

export async function parser(source: string) {
  const testName = expect.getState().currentTestName!;
  const filename = testName.replace(/ >.+/, "");
  const result = await transformAsync(source, {
    filename,
    cwd: "/",
    plugins: [[Plugin, {}]],
  });

  if (!result) throw new Error("No result from babel transform");

  return format(result.code!, {
    singleQuote: true,
    trailingComma: "none",
    jsxBracketSameLine: true,
    printWidth: 65,
    parser: "babel",
  }).replace(/\n$/gm, "");
};