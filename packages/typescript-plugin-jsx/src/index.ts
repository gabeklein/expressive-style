import ts from "typescript/lib/tsserverlibrary";

import { expressionInLabelStatement } from "./expressionInLabelStatement";
import { stylePropertyStatement } from "./stylePropertyStatement";
import { stylePropertyValue } from "./stylePropertyValue";
import {
  findIdentifierNodeAtPosition,
  findNodeAtPosition,
  isPositionInLabelStatement,
} from "./util";

function init(modules: { typescript: typeof ts }) {
  const { ScriptElementKind } = modules.typescript;

  function create(info: ts.server.PluginCreateInfo) {
    const { languageService: service } = info;
    const { logger } = info.project.projectService;

    logger.info("Loaded Expressive JSX Typescript Plugin");

    const proxy: ts.LanguageService = Object.create(null);

    for (const k of Object.keys(service) as Array<keyof ts.LanguageService>) {
      const x = service[k]!;
      // @ts-expect-error - JS runtime trickery which is tricky to type tersely
      proxy[k] = (...args: Array<{}>) => x.apply(service, args);
    }

    proxy.getSuggestionDiagnostics = (fileName) => {
      const issues = service.getSuggestionDiagnostics(fileName);
      const sourceFile = service.getProgram()?.getSourceFile(fileName);

      if (!sourceFile) return issues;

      return issues.filter((diagnostic) => {
        if (stylePropertyStatement(diagnostic)) return false;

        return true;
      });
    };

    proxy.getSemanticDiagnostics = (fileName) => {
      const issues = service.getSemanticDiagnostics(fileName);

      return issues.filter((diagnostic) => {
        try {
          if (isThisElement(diagnostic)) return false;

          if (stylePropertyValue(diagnostic)) return false;

          if (expressionInLabelStatement(diagnostic)) return false;

          if (isStyleCondition(diagnostic)) return false;
        } catch (e) {
          logger.info("Error in getSemanticDiagnostics: " + e);
        }

        return true;
      });
    };

    proxy.getQuickInfoAtPosition = (fileName, position) => {
      const sourceFile = service.getProgram()?.getSourceFile(fileName);

      if (sourceFile) {
        const labelCheck = isPositionInLabelStatement(sourceFile, position);

        if (labelCheck.isInLabel && labelCheck.identifierName) {
          const identifierNode = findIdentifierNodeAtPosition(
            sourceFile,
            position
          );

          if (identifierNode) {
            return {
              kind: ScriptElementKind.constElement,
              kindModifiers: "declare",
              textSpan: {
                start: identifierNode.getStart(),
                length: identifierNode.getWidth(),
              },
              displayParts: [
                { text: `"${identifierNode.text}"`, kind: "stringLiteral" },
              ],
            };
          }
        }
      }

      return service.getQuickInfoAtPosition(fileName, position);
    };

    return proxy;
  }

  return { create };
}

function isThisElement(diagnostic: ts.Diagnostic): boolean {
  const { code, messageText } = diagnostic;

  if (code === 2604 || code === 2786) {
    const error =
      typeof messageText === "string" ? messageText : messageText.messageText;
    return error.includes("'this'");
  }
  return false;
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

export = init;
