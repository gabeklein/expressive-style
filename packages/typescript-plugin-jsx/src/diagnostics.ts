import ts from "typescript/lib/tsserverlibrary";
import { log } from "./logger";
import {
  findNodeAtPosition,
  flattenMessage,
  isExpressionInLabelStatement,
  isPositionInLabelStatement,
} from "./util";

export function diagnostics(diagnostic: ts.Diagnostic): boolean {
  try {
    if (stylePropertyValue(diagnostic)) return false;
    if (expressionInLabelStatement(diagnostic)) return false;
    if (isStyleCondition(diagnostic)) return false;
    if (isUnderscoreJsxAttribute(diagnostic)) return false;
  } catch (e) {
    log("Error in getSemanticDiagnostics: " + e);
  }

  return true;
}

function isUnderscoreJsxAttribute(diagnostic: ts.Diagnostic): boolean {
  const { file, start } = diagnostic;

  if (!file || start === undefined) return false;
  if (!isInJsxElement(file, start)) return false;

  return /Property '_\w+' does not exist/.test(
    flattenMessage(diagnostic.messageText),
  );
}

function isStyleCondition(diagnostic: ts.Diagnostic): boolean {
  if (diagnostic.code !== 2872) return false;

  const file = diagnostic.file!;

  if (!file) return false;

  const node = findNodeAtPosition(file, diagnostic.start);

  if (!node) return false;

  const { kind, parent } = node;

  if (kind !== ts.SyntaxKind.StringLiteral) return false;

  if (!parent || parent.kind !== ts.SyntaxKind.IfStatement) return false;

  const { thenStatement } = parent as ts.IfStatement;

  if (thenStatement.kind === ts.SyntaxKind.LabeledStatement) return true;
  else if (thenStatement.kind === ts.SyntaxKind.Block) {
    const { statements } = thenStatement as ts.Block;

    for (const child of statements)
      if (child.kind === ts.SyntaxKind.LabeledStatement) return true;
  }

  return false;
}

function stylePropertyValue(diagnostic: ts.Diagnostic): boolean {
  const sourceFile = diagnostic.file!;
  if (diagnostic.code !== 2304) return false;
  const position = diagnostic.start;
  if (!position) return false;
  const labelCheck = isPositionInLabelStatement(sourceFile, position);
  if (labelCheck.isInLabel) {
    const messageText =
      typeof diagnostic.messageText === "string"
        ? diagnostic.messageText
        : diagnostic.messageText.messageText;
    const match = messageText.match(/Cannot find name ['"]([^'"]+)['"]/);
    const identifierInError = match ? match[1] : null;
    if (identifierInError && identifierInError === labelCheck.identifierName)
      return true;
  }
  return false;
}

function expressionInLabelStatement(diagnostic: ts.Diagnostic): boolean {
  const sourceFile = diagnostic.file!;
  if (diagnostic.code !== 2695) return false;
  const node = findNodeAtPosition(sourceFile, diagnostic.start);
  if (node) return isExpressionInLabelStatement(sourceFile, node);
  return false;
}

function isInJsxElement(sourceFile: ts.SourceFile, position?: number): boolean {
  if (position === undefined) return false;

  const node = findNodeAtPosition(sourceFile, position);
  if (!node) return false;

  // Walk up the tree to find if we're in a JSX element
  let current: ts.Node | undefined = node;
  while (current) {
    // Check for JSX attribute or JSX element
    if (
      current.kind === ts.SyntaxKind.JsxAttribute ||
      current.kind === ts.SyntaxKind.JsxElement ||
      current.kind === ts.SyntaxKind.JsxSelfClosingElement ||
      current.kind === ts.SyntaxKind.JsxOpeningElement
    ) {
      return true;
    }
    current = current.parent;
  }

  return false;
}
