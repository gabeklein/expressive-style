import type {
  template as _template,
  types as _types,
} from "@babel/core";

export type { types as T } from "@babel/core";

export let t: typeof _types;
export let template: typeof _template;

export function init(compiler: { types: typeof _types; template: typeof _template }) {
  t = compiler.types;
  template = compiler.template;
}
