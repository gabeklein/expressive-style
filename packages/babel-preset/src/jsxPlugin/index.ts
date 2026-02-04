import { PluginObj, PluginPass, NodePath, types as t } from "@babel/core";

import { Context, hash } from "./context";
import { Status } from "./errors";
import { getContext, handleLabel } from "./label";

import type { Macro, Options } from "./context";

const USING = new WeakMap<NodePath, Set<Context>>();
const SCOPE = new WeakMap<NodePath, Set<Context>>();
const IGNORED = new WeakSet<NodePath>();

type State = PluginPass & {
  context: Context;
  opts: Options;
};

declare namespace Plugin {
  export { Context, Macro, Options };
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
      LabeledStatement: {
        enter(path) {
          const body = path.get("body");

          if (body.isFor() || body.isWhile() || body.isDoWhileStatement()){
            IGNORED.add(path);
            return;
          }

          handleLabel(path);
        },
        exit(path) {
          if (IGNORED.has(path)) return;
          path.remove();
        },
      },
      IfStatement: {
        exit(path) {
          const context = Context.get(path);
          if (!context || context.alternate || path.key === "alternate") return;
          path.remove();
        },
      },
      Function: {
        exit(path) {
          const context = Context.get(path);
          if(!context || context.usedBy.size > 0 || context.props.size === 0) return;
          throw path.buildCodeFrameError("Component defines styles but returns no JSX.");
        },
      },
    },
  };
}

function JSX(path: NodePath<t.JSXElement> | NodePath<t.JSXFragment>) {
  if (USING.has(path)) return;

  const { parentPath: parent } = path;

  if (parent.isExpressionStatement() && parent.parentPath.isBlock())
    throw path.buildCodeFrameError(
      "Using JSX as an implicit return is no longer supported."
    );

  const isChild = parent.isJSXElement() || parent.isJSXFragment();
  const context = !isChild && getContext(path);
  const scope = new Set(context ? [context] : SCOPE.get(parent!));
  const using = new Set<Context>();

  const returned = isReturnedByComponent(path);

  SCOPE.set(path, scope);

  if (path.isJSXElement()) {
    const names = new Map<string, NodePath>();
    const opening = path.get("openingElement");
    let tag = opening.get("name");

    while (tag.isJSXMemberExpression()) {
      names.set(tag.get("property").toString(), tag);
      tag = tag.get("object");
    }

    if (tag.isJSXIdentifier()) {
      names.set(tag.toString(), tag);
    }

    opening.get("attributes").forEach((attr) => {
      if (!attr.isJSXAttribute() || attr.node.value) return;

      let { name } = attr.node.name;

      if (typeof name !== "string") name = name.name;

      names.set(name, attr);
    });

    if (returned) names.set("this", path);

    USING.set(path, using);

    names.forEach((attr, name) => {
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
      t.jsxOpeningElement(t.jSXIdentifier("div"), []),
      t.jsxClosingElement(t.jSXIdentifier("div")),
      path.node.children
    )
  );

  USING.set(inserted, new Set([context]));
  context.usedBy.add(inserted);
}

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
      if (t.isIdentifier(id) && /^[A-Z]/.test(id.name)) return true;
    }
  }

  return false;
}

function getUsing(path: NodePath) {
  return new Set(USING.get(path));
}

export { Context, getUsing, Macro, Options, Plugin, State };
