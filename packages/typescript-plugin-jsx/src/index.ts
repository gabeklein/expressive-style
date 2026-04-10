import ts from "typescript/lib/tsserverlibrary";

import { diagnostics } from "./diagnostics";
import { createCompletionsProxy } from "./completions";
import { log, setLogger } from "./logger";
import { stylePropertyStatement } from "./stylePropertyStatement";
import {
  findIdentifierNodeAtPosition,
  isPositionInLabelStatement,
} from "./util";
import { expressiveAttributeInfo } from "./getAttributeInfo";
import { expressiveLabelInfo, labelIdentifierInfo } from "./getPropertyInfo";


const factory: ts.server.PluginModuleFactory = (modules) => {
  const { ScriptElementKind } = modules.typescript;

  return {
    create({ languageService: service, project }) {
      setLogger(project.projectService.logger);

      log("Loaded Expressive JSX Typescript Plugin");

      const proxy = Object.assign({}, service);
      const { getCompletionEntryDetails, getCompletionsAtPosition } =
        createCompletionsProxy(service, ScriptElementKind);

      proxy.getCompletionsAtPosition = getCompletionsAtPosition;
      proxy.getCompletionEntryDetails = getCompletionEntryDetails;

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

      proxy.getQuickInfoAtPosition = (fileName, position) =>
        customQuickInfo(service, fileName, position) ||
        service.getQuickInfoAtPosition(fileName, position);

      return proxy;
    },
  };
};

function customQuickInfo(
  service: ts.LanguageService,
  fileName: string,
  position: number,
): ts.QuickInfo | undefined {
  const program = service.getProgram();

  if (!program) return;

  const sourceFile = program.getSourceFile(fileName);

  if (!sourceFile) return;

  const node = findIdentifierNodeAtPosition(sourceFile, position);

  if (!node) return;

  const info =
    expressiveLabelInfo(node, program) || expressiveAttributeInfo(node);

  if (info) return info;

  if (isPositionInLabelStatement(sourceFile, position).isInLabel)
    return labelIdentifierInfo(node);
}

export = factory;
