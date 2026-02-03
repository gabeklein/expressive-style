import { NodePath, types as t } from "@babel/core";

import { type Context } from "../jsxPlugin";

export function getClassName(
  context: Context,
  module?: t.Expression
): t.Expression | undefined {
  if (!context.props.size && !context.children.size) return;

  const { condition, alternate, uid } = context;

  if (typeof condition == "string" || t.isStringLiteral(condition)) return;

  const value = module
    ? t.memberExpression(module, t.identifier(uid), false)
    : t.stringLiteral(uid);

  if (!condition) return value;

  if (alternate) {
    let alt = getClassName(alternate, module);

    if (typeof alt === "string") alt = t.stringLiteral(alt);

    if (alt) return t.conditionalExpression(condition, value, alt);
  }

  return t.logicalExpression("&&", condition, value);
}

export function addClassName(
  path: NodePath<t.JSXElement>,
  name: string | t.Expression,
  getHelper: () => t.Identifier
) {
  const existing = hasProp(path, "className");
  const opening = path.get("openingElement");

  if (typeof name == "string") name = t.stringLiteral(name);

  if (t.isStringLiteral(existing) && t.isStringLiteral(name)) {
    existing.value += " " + name.value;
    return;
  }

  if (!existing) {
    opening.pushContainer(
      "attributes",
      t.jsxAttribute(
        t.jsxIdentifier("className"),
        t.isStringLiteral(name) ? name : t.jsxExpressionContainer(name)
      )
    );
    return;
  }

  const helper = getHelper();

  if (
    t.isCallExpression(existing) &&
    t.isIdentifier(existing.callee, { name: helper.name })
  ) {
    if (t.isStringLiteral(name))
      for (const value of existing.arguments)
        if (t.isStringLiteral(value)) {
          value.value += " " + name.value;
          return;
        }

    existing.arguments.push(name);
    return;
  }

  for (const attr of opening.get("attributes"))
    if (
      attr.isJSXAttribute() &&
      attr.get("name").isJSXIdentifier({ name: "className" })
    ) {
      attr.node.value = t.jsxExpressionContainer(
        t.callExpression(helper, [name, existing])
      );
      return;
    }

  throw new Error("Could not insert className");
}

export function setTagName(path: NodePath<t.JSXElement>, name: string) {
  const { openingElement, closingElement } = path.node;
  const tag = t.jsxIdentifier(name);

  openingElement.name = tag;

  if (closingElement) closingElement.name = tag;
}

export function hasProp(path: NodePath<t.JSXElement>, name: string) {
  for (const attr of path.node.openingElement.attributes)
    if (t.isJSXAttribute(attr) && attr.name.name === name) {
      const { value } = attr;

      if (t.isJSXExpressionContainer(value) && t.isExpression(value.expression))
        return value.expression;

      if (t.isExpression(value)) return value;
    }
}
