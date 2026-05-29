import * as babel from "@babel/core";
import BabelPreset from "@expressive/babel-preset-style";
import * as CSSMacros from "@expressive/css";

export interface TransformOptions extends BabelPreset.Options {
  test?: RegExp | ((uri: string) => boolean);
}

export interface TransformResult {
  code: string;
  map: any;
  css: string;
}

export async function transform(
  id: string,
  input: string,
  presetOptions: BabelPreset.Options = {}
): Promise<TransformResult> {
  const { macros = [], ...rest } = presetOptions;

  if (!macros.some((x) => x === false)) macros.push(CSSMacros);

  const result = await babel.transformAsync(input, {
    root: process.cwd(),
    filename: id,
    sourceFileName: id.split("?")[0],
    sourceMaps: true,
    parserOpts: {
      sourceType: "module",
      allowAwaitOutsideFunction: true,
    },
    generatorOpts: {
      decoratorsBeforeExport: true,
    },
    presets: [[BabelPreset, {
      ...rest,
      macros
    }]],
  });

  if (!result) throw new Error("No result");

  let {
    code,
    map,
    metadata: { css },
  } = result as BabelPreset.Result;

  if (!code) throw new Error("No code");

  return <TransformResult>{
    code,
    css,
    map,
  };
}

export function shouldTransform(options: TransformOptions) {
  const { test } = options;

  if (typeof test == "function") return test;

  if (test instanceof RegExp) return (id: string) => test.test(id);

  return (id: string) =>
    !/node_modules/.test(id) && /\.[jt]sx?$/.test(id);
}