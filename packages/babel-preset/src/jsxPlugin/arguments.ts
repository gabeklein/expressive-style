import type { NodePath, types as T } from "@babel/core";

import { t } from "../babel";

import { ParseErrors } from "./errors";

const Oops = ParseErrors({
  UnaryUseless: "Unary operator here doesn't do anything",
  HexNoNegative:
    'Hexadecimal numbers are converted into colors (#FFF) so negative sign doesn\'t mean anything here.\nParenthesize the number if you really need "-{1}" for some reason...',
  ArrowNotImplemented: "Arrow Function not supported yet",
  ArgumentSpread: "Cannot parse argument spreads for modifier handlers",
  UnknownArgument: "Unknown argument while parsing for modifier.",
  MustBeIdentifier:
    "Only Identifers allowed here! Call expression must reference another modifier.",
  ModiferCantParse: "Illegal value in modifier",
  ElseNotSupported: "An else statement in an if modifier is not yet supported",
});

function isParenthesized(node: T.Expression) {
  const { extra } = node as any;
  return extra ? extra.parenthesized === true : false;
}

type Argument =
  | [string, ...Argument[]]
  | T.Expression
  | string
  | number
  | boolean
  | null;

export function parseArguments(
  element: NodePath<T.ExpressionStatement>
): Argument[] {
  const { node } = element.get("expression");
  const expressions = t.isSequenceExpression(node) ? node.expressions : [node];

  return expressions.map((x) => parseExpression(x));
}

function parseExpression<T extends T.Expression>(element: T): any {
  if (t.isIdentifier(element)) return element.name;

  if (t.isStringLiteral(element)) {
    return element.value === "" ? '""' : element.value;
  }

  if (isParenthesized(element)) return element;

  if (t.isBooleanLiteral(element)) return element.value;

  if (t.isNullLiteral(element)) return null;

  if (t.isTemplateLiteral(element)) {
    return element;
  }

  if (t.isNumericLiteral(element)) {
    const { value, extra: { raw } = {} } = element as any;
    return String(value) == raw ? value : raw;
  }

  if (t.isUnaryExpression(element)) {
    const { argument, operator } = element;

    if (operator == "!" && t.isIdentifier(argument)) return "!" + argument.name;

    if (operator == "-" && t.isNumericLiteral(argument)) {
      const value = parseExpression(argument);

      if (typeof value === "number") return -1 * value;

      if (typeof value === "string") return "-" + value;
    }

    throw Oops.UnaryUseless(element);
  }

  if (t.isBinaryExpression(element)) {
    const { left, right, operator } = element;

    if (
      operator == "-" &&
      t.isIdentifier(left) &&
      t.isIdentifier(right, { start: left.end! + 1 })
    )
      return left.name + "-" + right.name;

    return [
      operator,
      parseExpression(element.left as T.Expression),
      parseExpression(element.right),
    ];
  }

  if (t.isCallExpression(element)) {
    const callee = element.callee;
    const args = [] as string[];

    if (callee.type !== "Identifier") throw Oops.MustBeIdentifier(callee);

    for (const item of element.arguments) {
      if (t.isSpreadElement(item)) throw Oops.ArgumentSpread(item);
      if (!t.isExpression(item)) throw Oops.UnknownArgument(item);

      args.push(parseExpression(item));
    }

    return [callee.name, ...args];
  }

  if (t.isArrowFunctionExpression(element)) {
    throw Oops.ArrowNotImplemented(element);
  }

  throw Oops.UnknownArgument(element);
}
