import { Hub, NodePath } from "@babel/traverse";
import {
  AssignmentExpression,
  Class,
  Function,
  JSXElement,
  VariableDeclaration,
} from "@babel/types";

import t from "./types";

export function getNames(path: NodePath<JSXElement>) {
  const names = new Map<string, NodePath>();
  const opening = path.get("openingElement");
  let tag = opening.get("name");

  while (tag.isJSXMemberExpression()) {
    names.set(tag.get("property").toString(), tag);
    tag = tag.get("object");
  }

  if (tag.isJSXIdentifier()) names.set(tag.toString(), tag);

  opening.get("attributes").forEach((attr) => {
    if (!attr.isJSXAttribute() || attr.node.value) return;

    let { name } = attr.node.name;

    if (typeof name !== "string") name = name.name;

    names.set(name, attr);
  });

  return names;
}

export function getName(path: NodePath): string {
  let encounteredReturn;

  while (path){
    if(path.isLabeledStatement()) {
      return path.node.label.name;
    }

    if(path.isVariableDeclarator()) {
      const { id } = path.node;
      return t.isIdentifier(id) ? id.name : (path.parent as VariableDeclaration).kind;
    }

    if(path.isAssignmentExpression() || path.isAssignmentPattern()) {
      const { left } = path.node as AssignmentExpression;
      return t.isIdentifier(left) ? left.name : "assignment";
    }

    if(path.isFunctionDeclaration()) {
      return path.node.id!.name;
    }

    if(path.isExportDefaultDeclaration()) {
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

    if(path.isArrowFunctionExpression()) {
      path = path.parentPath!;
      continue;
    }

    if(path.isReturnStatement()) {
      if (encounteredReturn) return "return";

      encounteredReturn = path;

      const ancestry = path.getAncestry();
      const within = ancestry.find((x) =>
        x.isFunction()
      ) as NodePath<Function>;

      const { node } = within;

      if ("id" in node && node.id) return node.id.name;

      if (t.isObjectMethod(node)) {
        path = within.getAncestry()[2];
        continue;
      }

      if (t.isClassMethod(node)) {
        if (node.key.type !== "Identifier") return "ClassMethod";

        if (node.key.name != "render") return node.key.name;

        const owner = within.parentPath.parentPath as NodePath<Class>;

        if (owner.node.id) return owner.node.id.name;

        path = owner.parentPath;
        continue;
      }

      path = within.parentPath;
      continue;
    }

    if(path.isObjectProperty()) {
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