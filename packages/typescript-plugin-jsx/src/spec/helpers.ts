import ts from "typescript/lib/tsserverlibrary";

import init from "..";

// Ambient types needed for tests: JSX for attribute filtering,
// Expressive for label hover/completion lookups.
const env = {
  "jsx.d.ts": `
    declare namespace JSX {
      interface Element {}
      interface IntrinsicAttributes {}
      interface IntrinsicElements {
        div: { children?: any; content?: string };
        span: { children?: any };
        input: {};
      }
    }
  `,
  "expressive.d.ts": `
    declare namespace Expressive {
      interface Properties {
        /** Sets the text color */
        color(value: string | number): void;
        /** Sets the display type */
        display(value: string): void;
      }
      interface Instructions {
        /** Applies styles on hover */
        hover(): void;
      }
    }
  `,
};

function createHarness(code: string, fileName = "file.tsx") {
  const files = { ...env, [fileName]: code } as Record<string, string>;
  const compilerOptions: ts.CompilerOptions = {
    jsx: ts.JsxEmit.Preserve,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    strict: true,
  };

  const host: ts.LanguageServiceHost = {
    getScriptFileNames: () => Object.keys(files),
    getScriptVersion: () => "1",
    getScriptSnapshot: (name) => {
      const text = files[name];
      return text !== undefined
        ? ts.ScriptSnapshot.fromString(text)
        : undefined;
    },
    getCurrentDirectory: () => "/",
    getCompilationSettings: () => compilerOptions,
    getDefaultLibFileName: (opts) => ts.getDefaultLibFilePath(opts),
    fileExists: (filePath) => files[filePath] !== undefined,
    readFile: (filePath) => files[filePath],
    readDirectory: () => Object.keys(files),
  };

  const languageService = ts.createLanguageService(host);
  const plugin = init({ typescript: ts });
  const logger = { info: () => {}, log: () => {}, error: () => {} };
  const proxy = plugin.create({
    languageService,
    project: { projectService: { logger } },
  } as any);

  return { proxy, fileName };
}

/**
 * Runs the plugin against `code` and returns semantic diagnostics.
 */
export function getDiagnosticsWithPlugin(
  code: string,
  fileName = "file.tsx",
): ts.Diagnostic[] {
  const { proxy, fileName: name } = createHarness(code, fileName);
  return proxy.getSemanticDiagnostics(name);
}

/**
 * Runs the plugin against `code` containing a `|` marker and returns
 * quick info at the marker's position. The marker is stripped before
 * the source is handed to TypeScript.
 */
export function getQuickInfoWithPlugin(
  code: string,
  fileName = "file.tsx",
): ts.QuickInfo | undefined {
  const position = code.indexOf("|");
  if (position < 0) throw new Error("getQuickInfoWithPlugin: missing | marker");

  const stripped = code.slice(0, position) + code.slice(position + 1);
  const { proxy, fileName: name } = createHarness(stripped, fileName);
  return proxy.getQuickInfoAtPosition!(name, position);
}

/**
 * Joins a QuickInfo's displayParts into a plain string for easy assertion.
 */
export function displayText(info: ts.QuickInfo | undefined): string {
  return info?.displayParts?.map(p => p.text).join("") ?? "";
}

/**
 * Joins a QuickInfo's documentation into a plain string.
 */
export function docText(info: ts.QuickInfo | undefined): string {
  return info?.documentation?.map(p => p.text).join("") ?? "";
}
