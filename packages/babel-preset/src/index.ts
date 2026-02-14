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
import * as DefaultMacros from "./macros";

export interface Options {
  cssModule?: string;
  macros?: (Record<string, Plugin.Macro> | false)[];
  define?: Record<string, Plugin.Context>[];
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

  const { macros = [] } = options;

  if (!macros.some((x) => x === false)) {
    macros.push(DefaultMacros);
  }

  return {
    plugins: [
      [Plugin, { ...options, macros }],
      [CSSPlugin, options],
    ],
  };
}

export default Preset;
