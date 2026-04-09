import type {
  BabelFile,
  BabelFileMetadata,
  BabelFileResult,
  PluginPass,
  TransformOptions,
  types as T,
} from "@babel/core";

import { init } from "./babel";
import { Plugin } from "./jsxPlugin";
import { CSSPlugin } from "./cssPlugin";
import { DefaultInstructions } from "./instructions";

export interface Options {
  cssModule?: string;
  macros?: (Record<string, Plugin.Macro> | false)[];
  define?: Record<string, Plugin.Context>[];
  instructions?: Record<string, Plugin.Instruction>[];
}

export interface State extends PluginPass {
  file: BabelFile & {
    metadata: Preset.MetaData;
  };
}

export declare namespace Preset {
  interface Meta extends BabelFileMetadata {
    css: string;
  }
  interface Result extends BabelFileResult {
    metadata: Meta;
    code: string;
  }
  interface MetaData {
    readonly css: string;
    readonly cssModuleId?: T.Identifier;
    readonly styles: Map<string, Plugin.Context>;
  }

  export { Meta, MetaData, Options, Result };
}

export function Preset(
  compiler: unknown,
  options: Preset.Options = {}
): TransformOptions {
  init(compiler as any);

  const { macros = [], instructions = [] } = options;

  instructions.push(DefaultInstructions);

  return {
    plugins: [
      [Plugin, { ...options, macros, instructions }],
      [CSSPlugin, options],
    ],
  };
}

export default Preset;
