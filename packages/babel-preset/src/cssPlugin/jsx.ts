import { NodePath, template, types as t } from "@babel/core";

import { type Context } from "../jsxPlugin";
import { State } from "..";

const classNamesHelper = template.ast`
  (...args) => args.filter(Boolean).join(" ");
` as t.ExpressionStatement;

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
  state: State
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

  const helper = ensureHelper(state);

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

export function hasProp(path: NodePath<t.JSXElement>, name: string) {
  for (const attr of path.node.openingElement.attributes)
    if (t.isJSXAttribute(attr) && attr.name.name === name) {
      const { value } = attr;

      if (t.isJSXExpressionContainer(value) && t.isExpression(value.expression))
        return value.expression;

      if (t.isExpression(value)) return value;
    }
}

export function getComponentProp(path: NodePath, name: string) {
  const func = path.find((x) => x.isFunction()) as NodePath<t.Function>;
  let [props] = func.node.params;

  if (t.isObjectPattern(props)) {
    const { properties } = props;

    const prop = properties.find(
      (x) => t.isObjectProperty(x) && t.isIdentifier(x.key, { name })
    ) as t.ObjectProperty | undefined;

    if (prop) return;

    const id = t.identifier(name);

    properties.unshift(t.objectProperty(id, id, false, true));

    return id;
  } else if (!props) {
    props = uniqueIdentifier(path, "props");
    func.unshiftContainer("params", props);
  }

  if (t.isIdentifier(props))
    return t.memberExpression(props, t.identifier(name));

  throw new Error(`Expected an Identifier or ObjectPattern, got ${props.type}`);
}

export function uniqueIdentifier(path: NodePath, name = "temp") {
  const { scope } = path;

  let uid = name;
  let i = 0;

  while (scope.hasLabel(uid) || scope.hasBinding(uid) || scope.hasGlobal(uid)) {
    uid = name + ++i;
  }

  if (i > 1) uid = name + i;

  return t.identifier(uid);
}

function ensureHelper(state: State): t.Identifier {
  if (state.classNameHelper) return state.classNameHelper as any;

  const program = state.file.path as unknown as NodePath<t.Program>;
  const helper = program.scope.generateUidIdentifier("concat");
  state.classNameHelper = helper;

  program.unshiftContainer(
    "body",
    t.variableDeclaration("const", [
      t.variableDeclarator(helper, classNamesHelper.expression),
    ])
  );

  return helper;
}
