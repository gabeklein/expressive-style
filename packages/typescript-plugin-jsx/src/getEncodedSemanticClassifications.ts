import ts from "typescript/lib/tsserverlibrary";
import { findNodeAtPosition, isExpressionInLabelStatement, labelContainsNormalControlFlow } from "./util";

export function getEncodedSemanticClassifications(
  this: ts.LanguageService,
  fileName: string,
  span: ts.TextSpan,
): ts.Classifications {
  const original = this.getEncodedSemanticClassifications(fileName, span);
  const sourceFile = this.getProgram()?.getSourceFile(fileName);

  if (!sourceFile) return original;

  const { spans } = original;
  const modifiedSpans: number[] = [];

  for (let i = 0; i < spans.length; i += 3) {
    const start = spans[i];
    const length = spans[i + 1];
    const classification = spans[i + 2];

    const isUnreachableCode = (classification & 8) !== 0;
    const isUnusedDeclaration = (classification & 16) !== 0;

    const position = start + span.start;
    const nodeAtPosition = findNodeAtPosition(sourceFile, position);

    if (
      isUnreachableCode &&
      nodeAtPosition &&
      isExpressionInLabelStatement(sourceFile, nodeAtPosition)
    ) {
      const newClassification = classification & ~8; // Remove the unreachable flag
      modifiedSpans.push(start, length, newClassification);
      continue;
    }

    if (isUnusedDeclaration && nodeAtPosition) {
      const parent = nodeAtPosition.parent;
      if (parent && parent.kind === ts.SyntaxKind.LabeledStatement) {
        const labeledStatement = parent as ts.LabeledStatement;
        if (!labelContainsNormalControlFlow(labeledStatement)) {
          const newClassification = classification & ~16; // Remove the unused flag
          modifiedSpans.push(start, length, newClassification);
          continue;
        }
      }
    }

    modifiedSpans.push(start, length, classification);
  }

  return {
    spans: modifiedSpans,
    endOfLineState: original.endOfLineState,
  };
}
