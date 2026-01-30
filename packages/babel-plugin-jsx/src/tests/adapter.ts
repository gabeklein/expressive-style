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

const defaultParser = createParser();

function parser(code: string): Promise<Output>;
function parser(options: any): (code: string) => Promise<Output>;
function parser(argument?: any | string) {
  return typeof argument === "string"
    ? defaultParser(argument)
    : createParser(argument);
}

function createParser(options?: any) {
  return async function parse(source: string) {
    const testName = expect.getState().currentTestName!;
    const filename = testName.replace(/ >.+/, "");
    const result = await transformAsync(source, {
      filename,
      cwd: "/",
      plugins: [[Plugin, options]],
    });

    if (!result) throw new Error("No result from babel transform");

    let code = format(result.code!, {
      singleQuote: true,
      trailingComma: "none",
      jsxBracketSameLine: true,
      printWidth: 65,
      parser: "babel",
    });

    code = code.replace(/\n$/gm, "");

    return <Output>{
      code,
    };
  };
}

export { parser };
