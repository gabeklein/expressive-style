import ts from "typescript/lib/tsserverlibrary";
import { log } from "./logger";
import { findNodeAtPosition } from "./util";

const PROPERTY_COMPLETIONS_CACHE = new Map<string, ts.CompletionEntry[]>();
const INSTRUCTION_COMPLETIONS_CACHE = new Map<string, ts.CompletionEntry[]>();

const MEMBERS_CACHE = new Map<string, ts.Symbol[]>();

export function resolveInterfaceMembers(
  checker: ts.TypeChecker,
  program: ts.Program,
  namespaceName: string,
  interfaceName: string,
): ts.Symbol[] | undefined {
  const key = `${namespaceName}.${interfaceName}`;
  const cached = MEMBERS_CACHE.get(key);
  if (cached) return cached;

  for (const sourceFile of program.getSourceFiles()) {
    const symbols = checker.getSymbolsInScope(sourceFile, ts.SymbolFlags.Namespace);
    const ns = symbols.find(s => s.name === namespaceName);
    if (!ns) continue;

    const exports = checker.getExportsOfModule(ns);
    const iface = exports.find(s => s.name === interfaceName);
    if (!iface) continue;

    const ifaceType = checker.getDeclaredTypeOfSymbol(iface);
    const members = ifaceType.getProperties();
    MEMBERS_CACHE.set(key, members);
    return members;
  }
}

function getPropertyCompletions(
  checker: ts.TypeChecker,
  program: ts.Program,
  ScriptElementKind: typeof ts.ScriptElementKind,
): ts.CompletionEntry[] {
  const key = "properties";
  const cached = PROPERTY_COMPLETIONS_CACHE.get(key);
  if (cached) return cached;

  const members = resolveInterfaceMembers(checker, program, "Expressive", "Properties");
  if (!members) return [];

  const entries: ts.CompletionEntry[] = members.map(member => ({
    name: member.name,
    kind: ScriptElementKind.memberVariableElement,
    sortText: "0",
    insertText: member.name + ": ",
  }));

  PROPERTY_COMPLETIONS_CACHE.set(key, entries);
  return entries;
}

function getInstructionCompletions(
  checker: ts.TypeChecker,
  program: ts.Program,
  ScriptElementKind: typeof ts.ScriptElementKind,
): ts.CompletionEntry[] {
  const key = "instructions";
  const cached = INSTRUCTION_COMPLETIONS_CACHE.get(key);
  if (cached) return cached;

  const members = resolveInterfaceMembers(checker, program, "Expressive", "Instructions");
  if (!members) return [];

  const entries: ts.CompletionEntry[] = members.map(member => ({
    name: "$" + member.name,
    kind: ScriptElementKind.memberVariableElement,
    sortText: "1",
    insertText: "$" + member.name + ": ",
  }));

  INSTRUCTION_COMPLETIONS_CACHE.set(key, entries);
  return entries;
}

function isInComponentBody(
  sourceFile: ts.SourceFile,
  position: number,
): boolean {
  const node = findNodeAtPosition(sourceFile, position);
  if (!node) return false;

  let current: ts.Node | undefined = node;

  while (current) {
    if (
      current.kind === ts.SyntaxKind.ArrowFunction ||
      current.kind === ts.SyntaxKind.FunctionDeclaration ||
      current.kind === ts.SyntaxKind.FunctionExpression
    ) {
      return true;
    }

    if (
      current.kind === ts.SyntaxKind.JsxElement ||
      current.kind === ts.SyntaxKind.JsxSelfClosingElement ||
      current.kind === ts.SyntaxKind.JsxOpeningElement
    ) {
      return false;
    }

    current = current.parent;
  }

  return false;
}

export function createCompletionsProxy(
  service: ts.LanguageService,
  ScriptElementKind: typeof ts.ScriptElementKind,
) {
  function getCompletionsAtPosition(
    fileName: string,
    position: number,
    options: ts.GetCompletionsAtPositionOptions | undefined,
  ): ts.WithMetadata<ts.CompletionInfo> | undefined {
    const program = service.getProgram();
    const sourceFile = program?.getSourceFile(fileName);

    if (!sourceFile || !program || !isInComponentBody(sourceFile, position))
      return service.getCompletionsAtPosition(fileName, position, options);

    const checker = program.getTypeChecker();

    const text = sourceFile.text;
    const lineStart = text.lastIndexOf("\n", position - 1) + 1;
    const prefix = text.slice(lineStart, position).trimStart();

    const isInstruction = prefix.startsWith("$");

    try {
      const prior = service.getCompletionsAtPosition(fileName, position, options);

      const properties = getPropertyCompletions(checker, program, ScriptElementKind);
      const instructions = getInstructionCompletions(checker, program, ScriptElementKind);

      const extra = isInstruction ? instructions : [...properties, ...instructions];

      if (!extra.length) return prior;

      if (prior) {
        prior.entries = [...extra, ...prior.entries];
        return prior;
      }

      return {
        entries: extra,
        isGlobalCompletion: false,
        isMemberCompletion: false,
        isNewIdentifierLocation: false,
      };
    } catch (e) {
      log("Error in getCompletionsAtPosition: " + e);
      return service.getCompletionsAtPosition(fileName, position, options);
    }
  }

  function getCompletionEntryDetails(
    fileName: string,
    position: number,
    entryName: string,
    formatOptions: ts.FormatCodeSettings | undefined,
    source: string | undefined,
    preferences: ts.UserPreferences | undefined,
    data: ts.CompletionEntryData | undefined,
  ): ts.CompletionEntryDetails | undefined {
    const program = service.getProgram();

    if (program) {
      const checker = program.getTypeChecker();
      const isInstruction = entryName.startsWith("$");
      const lookupName = isInstruction ? entryName.slice(1) : entryName;
      const interfaceName = isInstruction ? "Instructions" : "Properties";

      const sourceFile = program.getSourceFile(fileName);
      if (!sourceFile) {
        return service.getCompletionEntryDetails(fileName, position, entryName, formatOptions, source, preferences, data);
      }

      const members = resolveInterfaceMembers(checker, program, "Expressive", interfaceName);
      const member = members?.find(m => m.name === lookupName);

      if (member) {
        const memberType = checker.getTypeOfSymbol(member);
        const signatures = memberType.getCallSignatures();
        const parts: ts.SymbolDisplayPart[] = [];

        if (signatures.length > 0) {
          const sig = signatures[0];
          const params = sig.getParameters();

          parts.push({ text: entryName, kind: "propertyName" });
          parts.push({ text: ": ", kind: "punctuation" });
          parts.push({
            text: params
              .map(p => {
                const pType = checker.getTypeOfSymbol(p);
                const typeStr = checker.typeToString(pType);
                const decl = p.getDeclarations()?.[0];
                const optional = decl && ts.isParameter(decl) && !!decl.questionToken;
                return `${p.name}${optional ? "?" : ""}: ${typeStr}`;
              })
              .join(", "),
            kind: "text",
          });
        }

        const jsDoc = member.getJsDocTags();
        const documentation: ts.SymbolDisplayPart[] = [];

        const comment = ts.displayPartsToString(
          member.getDocumentationComment(checker),
        );

        if (comment) {
          documentation.push({ text: comment, kind: "text" });
        }

        return {
          name: entryName,
          kind: ScriptElementKind.memberVariableElement,
          kindModifiers: "",
          displayParts: parts,
          documentation,
          tags: jsDoc,
        };
      }
    }

    return service.getCompletionEntryDetails(
      fileName,
      position,
      entryName,
      formatOptions,
      source,
      preferences,
      data,
    );
  }

  return {
    getCompletionsAtPosition,
    getCompletionEntryDetails,
  };
}
