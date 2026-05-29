import ts from "typescript/lib/tsserverlibrary";

interface Match {
  path: string[];
  block: ts.LabeledStatement;
  properties: ts.LabeledStatement[];
}

export function expressiveAttributeInfo(
  node: ts.Identifier,
): ts.QuickInfo | undefined {
  const { parent } = node;

  if (!parent || !ts.isJsxAttribute(parent) || parent.name !== node)
    return;

  const attrName = node.text;

  if (!attrName.startsWith("_"))
    return;

  const target = attrName.slice(1);
  const func = findEnclosingFunction(node);

  if (!func || !func.body || !ts.isBlock(func.body))
    return;

  const matches: Match[] = [];
  collectMatches(func.body, [], target, matches);

  if (!matches.length)
    return;

  const sourceFile = node.getSourceFile();

  return {
    kind: ts.ScriptElementKind.constElement,
    kindModifiers: "",
    textSpan: {
      start: node.getStart(),
      length: node.getWidth(),
    },
    displayParts: buildDisplayParts(matches, sourceFile),
    documentation: [],
  };
}

function findEnclosingFunction(node: ts.Node): ts.FunctionLikeDeclaration | undefined {
  let current: ts.Node | undefined = node.parent;

  while (current) {
    if (
      ts.isArrowFunction(current) ||
      ts.isFunctionDeclaration(current) ||
      ts.isFunctionExpression(current) ||
      ts.isMethodDeclaration(current)
    )
      return current;

    current = current.parent;
  }
}

function collectMatches(
  node: ts.Node,
  path: string[],
  target: string,
  results: Match[],
) {
  if (ts.isLabeledStatement(node)) {
    const name = node.label.text;
    const newPath = [...path, name];

    if (name === target)
      results.push({
        path: newPath,
        block: node,
        properties: extractProperties(node.statement),
      });

    collectMatches(node.statement, newPath, target, results);
    return;
  }

  ts.forEachChild(node, child => collectMatches(child, path, target, results));
}

function extractProperties(statement: ts.Statement): ts.LabeledStatement[] {
  const result: ts.LabeledStatement[] = [];

  const add = (s: ts.Statement) => {
    if (ts.isLabeledStatement(s) && !ts.isBlock(s.statement))
      result.push(s);
  };

  if (ts.isBlock(statement))
    statement.statements.forEach(add);
  else
    add(statement);

  return result;
}

function buildDisplayParts(
  matches: Match[],
  sourceFile: ts.SourceFile,
): ts.SymbolDisplayPart[] {
  const parts: ts.SymbolDisplayPart[] = [];

  matches.forEach((match, i) => {
    if (i > 0) {
      parts.push({ text: "\n", kind: "lineBreak" });
      parts.push({ text: "\n", kind: "lineBreak" });
    }

    // Header: "outer > inner (line 20)"
    match.path.forEach((seg, j) => {
      if (j > 0)
        parts.push({ text: " > ", kind: "punctuation" });

      parts.push({ text: seg, kind: "propertyName" });
    });

    const { line } = sourceFile.getLineAndCharacterOfPosition(match.block.getStart());
    parts.push({ text: ` (line ${line + 1})`, kind: "text" });

    for (const prop of match.properties) {
      parts.push({ text: "\n", kind: "lineBreak" });
      parts.push({ text: "  ", kind: "space" });
      parts.push({ text: prop.label.text, kind: "propertyName" });
      parts.push({ text: ": ", kind: "punctuation" });

      const value = ts.isExpressionStatement(prop.statement)
        ? prop.statement.expression.getText(sourceFile)
        : prop.statement.getText(sourceFile).replace(/;$/, "");

      parts.push({ text: value, kind: "text" });
    }
  });

  return parts;
}
