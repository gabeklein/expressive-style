import ts from "typescript/lib/tsserverlibrary";

import { diagnostics } from "./diagnostics";
import { log, setLogger } from "./logger";
import { stylePropertyStatement } from "./stylePropertyStatement";
import {
  findIdentifierNodeAtPosition,
  findNodeAtPosition,
  isPositionInLabelStatement,
} from "./util";

const factory: ts.server.PluginModuleFactory = (modules) => {
  const { ScriptElementKind } = modules.typescript;

  return {
    create({ languageService: service, project }) {
      setLogger(project.projectService.logger);

      log("Loaded Expressive JSX Typescript Plugin");

      const proxy = Object.assign({}, service);

      proxy.getSuggestionDiagnostics = (fileName) => {
        const issues = service.getSuggestionDiagnostics(fileName);
        const sourceFile = service.getProgram()?.getSourceFile(fileName);

        if (!sourceFile) return issues;

        return issues.filter((diagnostic) => {
          return stylePropertyStatement(diagnostic) === false;
        });
      };

      proxy.getSemanticDiagnostics = (fileName) =>
        service.getSemanticDiagnostics(fileName).filter(diagnostics);


      proxy.getQuickInfoAtPosition = (fileName, position) => {
        const sourceFile = service.getProgram()?.getSourceFile(fileName);

        if (sourceFile) {
          const labelCheck = isPositionInLabelStatement(sourceFile, position);

          if (labelCheck.isInLabel && labelCheck.identifierName) {
            const identifierNode = findIdentifierNodeAtPosition(
              sourceFile,
              position,
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
    },
  };
};

export = factory;
