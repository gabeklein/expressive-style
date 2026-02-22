import type { NodePath, PluginPass, types as T } from "@babel/core";

import { State } from ".";

export type Macro = (
  this: Context,
  ...args: any[]
) => Record<string, any> | void;

export interface Options {
  macros?: Record<string, Macro>[];
  define?: Record<string, Context>[];
}

export type BabelState = PluginPass & {
  context: Context;
  opts: Options;
};

const CONTEXT = new WeakMap<NodePath, Context>();

export class Context {
  readonly path: NodePath;
  readonly position: number;
  readonly parent: Context | undefined;

  readonly define: Record<string, Context> = {};
  readonly macros: Record<string, Macro> = {};

  uid: string;

  also = new Set<Context>();
  props = new Map<string, any>();
  usedBy = new Set<NodePath>();
  children = new Set<Context>();
  condition?: T.Expression | string;
  alternate?: Context;

  static get(from: NodePath) {
    return CONTEXT.get(from);
  }

  constructor(path: NodePath, parent?: Context, name?: string) {
    CONTEXT.set(path, this);
    this.path = path;
    this.position = path.node?.start ?? 0;
    this.uid = "";

    if (!(parent instanceof Context)) return;

    this.parent = parent;
    this.uid = name + "_" + hash(parent.uid);
    this.define = Object.create(parent.define);
    this.macros = Object.create(parent.macros);

    do
      if (parent.condition) {
        parent.children.add(this);
      }
    while ((parent = parent.parent));
  }
}

export class RootContext extends Context {
  constructor(path: NodePath, state: State, public options: Options) {
    const { define = [], macros = [] } = options;

    super(path);
    this.uid = hash(state.filename!);
    Object.assign(this.define, ...define);
    Object.assign(this.macros, ...macros);
  }
}

export function hash(input: string = String(Math.random()), length = 3) {
  let hash = 0;
  if (input.length === 0) return "";

  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32bit integer
  }

  // Convert the hash to a base36 string
  return Math.abs(hash).toString(36).substring(0, length);
}
