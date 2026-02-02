import { PluginObj, PluginPass } from "@babel/core";
import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";

import { Context, hash } from "./context";
import { Status } from "./errors";
import { getContext, handleLabel } from "./label";
import { getNames } from "./names";

import type { Macro, Options } from "./context";

type State = PluginPass & {
  context: Context;
  opts: Options;
};

declare namespace Plugin {
  export { Context, Macro, Options };
}

const HANDLED = new WeakMap<NodePath, ExitCallback>();
const USING_KEY = Symbol("expressive context");

function getUsing(path: NodePath) {
  return new Set(path.getData(USING_KEY)) as Set<Context>;
}
const SCOPE = new WeakMap<NodePath, Set<Context>>();

/**
 * Checks if the JSXElement or JSXFragment is returned by a component.
 * The function may be a declaration, expression, or arrow function.
 * The function must have a name with a capital letter to be considered a component.
 */
function isReturnedByComponent(
  path: NodePath<t.JSXElement> | NodePath<t.JSXFragment>
) {
  let parent = path.parentPath;

  if (parent.isParenthesizedExpression()) parent = parent.parentPath;

  if (!parent.isReturnStatement() && !parent.isArrowFunctionExpression())
    return false;

  // Traverse up to find the containing function
  while (!parent.isFunction()) {
    if (parent.isProgram() || !parent.parentPath) return false;
    parent = parent.parentPath;
  }

  // Check for named function declarations/expressions
  if (parent.isFunctionDeclaration() || parent.isFunctionExpression()) {
    const { id } = parent.node;
    if (t.isIdentifier(id) && /^[A-Z]/.test(id.name)) return true;
  }

  // Handle arrow functions - check if assigned to a capitalized variable
  if (parent.isFunctionExpression() || parent.isArrowFunctionExpression()) {
    const varParent = parent.parentPath;

    if (varParent.isVariableDeclarator()) {
      const { id } = varParent.node;
      if (t.isIdentifier(id) && /^[A-Z]/.test(id.name)) {
        const binding = path.scope.getBinding(id.name);
        return binding ? binding.constantViolations.length === 0 : false;
      }
    }
  }

  return false;
}

function JSX(path: NodePath<t.JSXElement> | NodePath<t.JSXFragment>) {
  if (path.getData(USING_KEY)) return;

  let { parentPath: parent } = path;

  if (parent.isExpressionStatement() && parent.parentPath.isBlock())
    throw path.buildCodeFrameError("Using JSX as an implicit return is no longer supported.");

  const context =
    !parent!.isJSXElement() && !parent!.isJSXFragment() && getContext(path);
  const scope = new Set(context ? [context] : SCOPE.get(parent!));
  const using = new Set<Context>();

  if (parent!.isParenthesizedExpression()) parent = parent!.parentPath;

  const returned = isReturnedByComponent(path);

  SCOPE.set(path, scope);

  if (path.isJSXElement()) {
    const name = getNames(path);

    if (returned && !name.has("this")) name.set("this", path);

    name.forEach((attr, name) => {
      let used = false;

      //TODO: add flag for this to be enforced by plugin
      if (name.startsWith("_")) {
        name = name.slice(1);
        used = true;
      }

      for (let { define } of scope) {
        const apply = [] as Context[];

        for (
          let mod: Context;
          (mod = define[name]);
          define = Object.getPrototypeOf(define)
        ) {
          apply.push(mod, ...mod.also);
          used = true;

          if (name == "this") break;
        }

        apply.reverse().forEach((ctx) => {
          ctx.usedBy.add(path);
          scope.add(ctx);
          using.add(ctx);
        });
      }

      if (used && attr.isJSXAttribute()) attr.remove();
    });
  }

  path.setData(USING_KEY, using);

  if (
    returned === false ||
    context === false ||
    context.define.this !== context ||
    context.props.size === 0 ||
    context.usedBy.size
  )
    return;

  const [inserted] = path.replaceWith(
    t.jsxElement(
      t.jsxOpeningElement(t.jSXIdentifier("this"), []),
      t.jsxClosingElement(t.jSXIdentifier("this")),
      path.isJSXFragment() ? path.node.children : [path.node]
    )
  );

  inserted.setData(USING_KEY, new Set([context]));
}

function Plugin(_compiler: any, options: Options): PluginObj<State> {
  return {
    manipulateOptions(_options, parse) {
      parse.plugins.push("jsx");
    },
    visitor: {
      Program(path, state) {
        const context = new Context(path);

        Status.currentFile = state.file as any;
        context.uid = hash(state.filename!);
        context.define = Object.assign({}, ...(options.define || []));
        context.macros = Object.assign({}, ...(options.macros || []));
      },
      JSXElement: JSX,
      JSXFragment: JSX,
      BlockStatement: {
        exit,
      },
      LabeledStatement: {
        enter(path) {
          const body = path.get("body");

          if (body.isFor() || body.isWhile()) return;

          handleLabel(path);
          onExit(path, () => {
            if (!path.removed) path.remove();
          });
        },
        exit,
      },
    },
  };
}

type ExitCallback = (path: NodePath, key: string | number | null) => void;

function onExit(path: NodePath, callback: ExitCallback) {
  HANDLED.set(path, callback);
}

function exit(path: NodePath) {
  for (const p of path.getAncestry()) {
    if (p.isBlockStatement()) continue;

    const callback = HANDLED.get(p);

    if (callback) callback(p, p.key);
    else break;
  }
}

export { Context, getUsing, Macro, onExit, Options, Plugin, State };
