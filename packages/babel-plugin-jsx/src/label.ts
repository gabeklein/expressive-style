import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";

import { onExit } from ".";
import { parseArgument } from "./arguments";
import { Context, hash } from "./context";
import { getName } from "./names";

export function handleLabel(path: NodePath<t.LabeledStatement>) {
  const context = getContext(path);
  const body = path.get("body");
  let { name } = path.node.label;

  if (body.isBlockStatement()) {
    context.define[name] = new Context(path, context, name);
    return;
  }

  if (!body.isExpressionStatement())
    throw modifyError(body, "Not an expression", name);

  if (!context) throw modifyError(body, "Missing context", name);

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
  const name = getName(path);
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
