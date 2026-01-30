import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";

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

function isParenthesized(node: t.Expression) {
  const { extra } = node as any;
  return extra ? extra.parenthesized === true : false;
}

export function parseArgument(
  element: NodePath<t.ExpressionStatement>,
  childKey?: keyof t.Expression
) {
  const exp = element.get("expression").node;
  const args = parseExpression(exp, childKey);

  return Array.isArray(args) ? args : [args];
}

function parseExpression<T extends t.Expression>(element: T, childKey?: keyof T): any {
  if (childKey) element = element[childKey] as unknown as T;

  if (isParenthesized(element)) return element;

  if (t.isIdentifier(element)) {
    return element.name.replace(/([A-Z]+)/g, "-$1").toLowerCase();
  }

  if (t.isBooleanLiteral(element)) {
    return element.value;
  }

  if (t.isStringLiteral(element)) {
    if (element.value === "") return '""';
    return element.value;
  }

  if (t.isNullLiteral(element)) {
    return null;
  }

  if (t.isTemplateLiteral(element)) {
    if (element.quasis.length == 1) return element.quasis[0].value.raw;
    return element;
  }

  if (t.isNumericLiteral(element)) {
    return parseNumericLiteral(element, false);
  }

  if (t.isUnaryExpression(element)) {
    const { argument, operator } = element;

    if (operator == "-" && t.isNumericLiteral(argument))
      return parseNumericLiteral(argument, true);

    if (operator == "!" && t.isIdentifier(argument, { name: "important" }))
      return "!important";

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
      parseExpression(element, "left"),
      parseExpression(element, "right"),
    ];
  }

  if (t.isSequenceExpression(element)) {
    return element.expressions.map((x) => parseExpression(x));
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

    return callee.name + `(${args.join(", ")})`;
  }

  if (t.isArrowFunctionExpression(element)) {
    throw Oops.ArrowNotImplemented(element);
  }

  throw Oops.UnknownArgument(element);
}

function parseNumericLiteral(number: t.NumericLiteral, negative: boolean) {
  let {
    extra: { rawValue, raw },
  } = number as any;

  if (isParenthesized(number) || !/^0x/.test(raw)) {
    if (raw.indexOf(".") > 0) return negative ? "-" + raw : raw;

    return negative ? -rawValue : rawValue;
  }

  if (negative) throw Oops.HexNoNegative(number, rawValue);

  
  raw = raw.substring(2);

  if (raw.length == 1) raw = "000" + raw;
  else if (raw.length == 2) raw = "000000" + raw;

  if (raw.length % 4 == 0) {
    let decimal = [] as any[];

    if (raw.length == 4)
      // Convert shorthand: 'ABC' => 'AABBCC' => 0xAABBCC
      decimal = Array.from(raw as string).map((x) => parseInt(x + x, 16));
    else
      for (let i = 0; i < 4; i++)
        decimal.push(parseInt(raw.slice(i * 2, i * 2 + 2), 16));

    //decimal for opacity, also prevents repeating digits (i.e. 1/3)
    decimal[3] = (decimal[3] / 255).toFixed(3);

    return `rgba(${decimal.join(", ")})`;
  }

  return "#" + raw;
}