import ts from "typescript/lib/tsserverlibrary";
import { labelContainsNormalControlFlow } from "./util";

export function suggestionDiagnostics(diagnostic: ts.Diagnostic): boolean {
  if (diagnostic.code !== 7028) return true;
  const sourceFile = diagnostic.file;
  if (!sourceFile) return true;
  const label = findLabeledStatementNode(sourceFile, diagnostic.start!);
  if (!label || labelContainsNormalControlFlow(label)) return true;
  return false
}

function findLabeledStatementNode(
  sourceFile: ts.SourceFile,
  position: number
): ts.LabeledStatement | undefined {
  function find(node: ts.Node): ts.LabeledStatement | undefined {
    if (
      node.kind === ts.SyntaxKind.LabeledStatement &&
      node.getStart(sourceFile) <= position &&
      position < node.getEnd()
    ) {
      return node as ts.LabeledStatement;
    }
    return ts.forEachChild(node, find);
  }
  return find(sourceFile);
}