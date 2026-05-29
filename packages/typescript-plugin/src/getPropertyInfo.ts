import ts from "typescript";
import { resolveInterfaceMembers } from "./completions";

export function expressiveLabelInfo(
  node: ts.Identifier,
  program: ts.Program): ts.QuickInfo | undefined {
  const { parent } = node;

  if (!parent || parent.kind !== ts.SyntaxKind.LabeledStatement) return;

  if ((parent as ts.LabeledStatement).label !== node) return;

  const labelName = node.text;
  const isInstruction = labelName.startsWith("$");
  const lookupName = isInstruction ? labelName.slice(1) : labelName;
  const interfaceName = isInstruction ? "Instructions" : "Properties";

  const checker = program.getTypeChecker();
  const members = resolveInterfaceMembers(
    checker,
    program,
    "Expressive",
    interfaceName
  );
  const member = members?.find((m) => m.name === lookupName);

  if (!member) return;

  const memberType = checker.getTypeOfSymbol(member);
  const typeString = checker.typeToString(memberType);

  const documentation: ts.SymbolDisplayPart[] = [];
  const comment = ts.displayPartsToString(
    member.getDocumentationComment(checker)
  );

  if (comment) documentation.push({ text: comment, kind: "text" });

  return {
    kind: ts.ScriptElementKind.memberVariableElement,
    kindModifiers: "",
    textSpan: {
      start: node.getStart(),
      length: node.getWidth(),
    },
    tags: member.getJsDocTags(),
    displayParts: [
      { text: labelName, kind: "propertyName" },
      { text: ": ", kind: "punctuation" },
      { text: typeString, kind: "keyword" },
    ],
    documentation,
  };
}

export function labelIdentifierInfo(node: ts.Identifier): ts.QuickInfo {
  return {
    kind: ts.ScriptElementKind.constElement,
    kindModifiers: "declare",
    textSpan: {
      start: node.getStart(),
      length: node.getWidth(),
    },
    displayParts: [{ text: `"${node.text}"`, kind: "stringLiteral" }],
  };
}
