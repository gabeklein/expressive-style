import ts from "typescript/lib/tsserverlibrary";

import init from "..";

// Ambient JSX needed to exercise JSX attribute filtering.
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
};

/**
 * Creates an in-memory TypeScript LanguageService with the plugin enabled.
 * @param code The TypeScript/TSX code to check.
 * @param fileName The virtual file name (default: 'file.tsx').
 * @returns The diagnostics emitted by TypeScript with the plugin applied.
 */
export function getDiagnosticsWithPlugin(
  code: string,
  fileName = "file.tsx",
): ts.Diagnostic[] {
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

  return proxy.getSemanticDiagnostics(fileName);
}
