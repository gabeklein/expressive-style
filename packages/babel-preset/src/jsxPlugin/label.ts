import { NodePath, types as t } from "@babel/core";

import { parseArguments } from "./arguments";
import { Context, hash } from "./context";
import { macroError } from "./errors";

export function handleLabel(path: NodePath<t.LabeledStatement>) {
  const context = getContext(path);
  const body = path.get("body");
  let { name } = path.node.label;

  if (body.isBlockStatement()) {
    if (context.define["this"] === context && context.uid.startsWith(name + "_"))
      throw path.buildCodeFrameError(
        `Label "${name}" conflicts with the component name. Use a different name for this style scope.`
      );

    context.define[name] = new Context(path, context, name);
    return;
  }

  if (!body.isExpressionStatement()) {
    throw macroError(body, "Not an expression", name);
  }

  const args = parseArguments(body);

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
    throw macroError(body, err, name);
  }
}

export function getContext(path: NodePath): Context {
  let key = path.key;

  while ((path = path.parentPath!)) {
    let context = Context.get(path);

    if (!context) {
      if (path.isFunction()) context = createFunctionContext(path);
      else if (path.isIfStatement()) context = createIfContext(path);
    }

    if (context) return key === "alternate" ? getAlternate(context) : context;

    key = path.key;
  }

  throw new Error("Context not found");
}

function getAlternate(context: Context): Context {
  if (!context.alternate) {
    const altPath = context.path.get("alternate") as NodePath;
    context.alternate = new Context(altPath, context.parent, "else");
    context.children.add(context.alternate);
  }
  return context.alternate;
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

  return inner;
}

function createFunctionContext(path: NodePath<t.Function>) {
  const context = getContext(path);
  const name = getComponentName(path);
  const component = new Context(path, context, name);

  component.define["this"] = component;

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

      const within = path.findParent((x) =>
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
