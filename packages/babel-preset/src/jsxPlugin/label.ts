import { NodePath, types as t } from "@babel/core";

import { onExit } from ".";
import { parseArgument } from "./arguments";
import { Context, hash } from "./context";

export function handleLabel(path: NodePath<t.LabeledStatement>) {
  const context = getContext(path);
  const body = path.get("body");
  let { name } = path.node.label;

  if (body.isBlockStatement()) {
    context.define[name] = new Context(path, context, name);
    return;
  }

  if (!body.isExpressionStatement()) {
    throw modifyError(body, "Not an expression", name);
  }

  if (!context) {
    throw modifyError(body, "Missing context", name);
  }

  const args = parseArgument(body);

  try {
    const queue = [{ name, args }];

    while (queue.length) {
      const { name, args } = queue.pop()!;
      const macro = context.macros[name];
      const apply = (args: any) => {
        context.props.set(name, args);
      };

      if (!macro) {
        apply(args);
        continue;
      }

      const output = macro.apply(context, args);

      if (!output) continue;

      if (Array.isArray(output)) {
        apply(output);
        continue;
      }

      if (typeof output != "object")
        throw new Error("Invalid modifier output.");

      for (const key in output) {
        let args = output[key];

        if (args === undefined) continue;
        if (!Array.isArray(args)) args = [args];
        if (key === name) apply(args);
        else queue.push({ name: key, args });
      }
    }
  } catch (err: unknown) {
    throw modifyError(body, err, name);
  }
}

export function getContext(path: NodePath): Context {
  let key = path.key;

  while ((path = path.parentPath!)) {
    const context = Context.get(path);

    if (context instanceof Context) {
      if (key === "alternate") {
        let { alternate, parent, path } = context;

        if (!alternate) {
          alternate = new Context(path, parent, "else");
          context.children.add(alternate);
          context.alternate = alternate;
        }

        return alternate;
      }

      return context;
    }

    if (path.isFunction()) return createFunctionContext(path);

    if (path.isIfStatement()) return createIfContext(path);

    key = path.key;
  }

  throw new Error("Context not found");
}

function createFunctionContext(path: NodePath<t.Function>) {
  const name = getComponentName(path);
  const context = getContext(path);
  const component = new Context(path, context, name);
  const body = path.get("body");

  component.define["this"] = component;

  onExit(path, () => {
    if (body.isBlockStatement() && !body.get("body").length)
      body.pushContainer(
        "body",
        t.expressionStatement(
          t.jsxElement(
            t.jsxOpeningElement(t.jsxIdentifier("this"), [], true),
            null,
            [],
            true,
          ),
        ),
      );
  });

  return component;
}

function getComponentName(path: NodePath): string {
  let encounteredReturn;

  while (path) {
    if (path.isLabeledStatement()) {
      return path.node.label.name;
    }

    if (path.isVariableDeclarator()) {
      const { id } = path.node;
      return t.isIdentifier(id)
        ? id.name
        : (path.parent as t.VariableDeclaration).kind;
    }

    if (path.isAssignmentExpression() || path.isAssignmentPattern()) {
      const { left } = path.node as t.AssignmentExpression;
      return t.isIdentifier(left) ? left.name : "assignment";
    }

    if (path.isFunctionDeclaration()) {
      return path.node.id!.name;
    }

    if (path.isExportDefaultDeclaration()) {
      try {
        const { basename, dirname, sep: separator } = require("path");

        const url = (path.hub as any).file.opts.filename as string;
        const [base] = basename(url).split(".");

        if (base !== "index") return base;

        return dirname(url).split(separator).pop()!;
      } catch (err) {
        return "File";
      }
    }

    if (path.isArrowFunctionExpression()) {
      path = path.parentPath!;
      continue;
    }

    if (path.isReturnStatement()) {
      if (encounteredReturn) return "return";

      encounteredReturn = path;

      const ancestry = path.getAncestry();
      const within = ancestry.find((x) =>
        x.isFunction(),
      ) as NodePath<t.Function>;

      const { node } = within;

      if ("id" in node && node.id) return node.id.name;

      if (t.isObjectMethod(node)) {
        path = within.getAncestry()[2];
        continue;
      }

      if (t.isClassMethod(node)) {
        if (node.key.type !== "Identifier") return "ClassMethod";

        if (node.key.name != "render") return node.key.name;

        const owner = within.parentPath.parentPath as NodePath<t.Class>;

        if (owner.node.id) return owner.node.id.name;

        path = owner.parentPath!;
        continue;
      }

      path = within.parentPath!;
      continue;
    }

    if (path.isObjectProperty()) {
      const { key } = path.node;
      return t.isIdentifier(key)
        ? key.name
        : t.isStringLiteral(key)
          ? key.value
          : "property";
    }

    break;
  }

  return "element";
}

function createIfContext(path: NodePath<t.IfStatement>) {
  const test = path.node.test;
  const name = t.isIdentifier(test)
    ? test.name
    : "if_" + hash(path.get("test").getSource());

  const outer = getContext(path);
  const inner = new Context(path, outer, name);

  if (t.isStringLiteral(test)) {
    outer.children.add(inner);
    inner.uid = outer.uid;
    inner.condition = test.value;
  } else {
    outer.also.add(inner);
    inner.condition = test;
  }

  onExit(path, (path, key) => {
    if (key == "alternate" || inner.alternate) return;

    if (!path.removed) path.remove();
  });

  return inner;
}

function modifyError(path: NodePath, err: unknown, modifierName: string) {
  if (err instanceof Error) {
    // Build error with Babel integration for source location
    const error = path.hub.buildError(
      path.node,
      `Modifier "${modifierName}" failed: ${err.message}`,
    );

    // Trim stack frames after the parse call to hide internal steps
    const stackLines = err.stack!.split("\n    at ");
    const parseIndex = stackLines.findIndex((line) => /^parse/.test(line));
    error.stack = stackLines.slice(0, parseIndex + 1).join("\n    at ");

    return error;
  }

  return path.hub.buildError(
    path.node,
    `Modifier "${modifierName}" failed: ${err}`,
  );
}
