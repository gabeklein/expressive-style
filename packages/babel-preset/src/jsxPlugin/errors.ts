import type { Node, NodePath } from "@babel/core";

type ParseError = <T extends Node>(
  node: NodePath<T> | T,
  ...args: (string | number | boolean | null)[]
) => Error;

export const Status = {
  currentFile: undefined as unknown as File & {
    buildCodeFrameError<TError extends Error>(
      node: Node,
      msg: string,
      Error?: new (msg: string) => TError
    ): TError;
  },
};

export function ParseErrors<O extends Record<string, string>>(register: O) {
  const Errors = {} as Record<string, ParseError>;

  for (const error in register) {
    const message = [] as (string | number | boolean | null)[];

    for (const segment of register[error].split(/\{(?=\d+\})/)) {
      const ammend = /(\d+)\}(.*)/.exec(segment);
      if (ammend) message.push(parseInt(ammend[1]), ammend[2]);
      else message.push(segment);
    }

    Errors[error] = (node, ...args) => {
      let quote = "";

      if ("node" in node) node = node.node;

      for (const slice of message)
        quote += typeof slice == "string" ? slice : args[(slice as number) - 1];

      return Status.currentFile.buildCodeFrameError(node, quote);
    };
  }

  return Errors as {
    readonly [P in keyof O]: ParseError;
  };
}

export function macroError(path: NodePath, err: unknown, modifierName: string) {
  if (err instanceof Error) {
    // Build error with Babel integration for source location
    const error = path.hub.buildError(
      path.node,
      `Modifier "${modifierName}" failed: ${err.message}`
    );

    // Trim stack frames after the parse call to hide internal steps
    const stackLines = err.stack!.split("\n    at ");
    const parseIndex = stackLines.findIndex((line) => /^parse/.test(line));
    error.stack = stackLines.slice(0, parseIndex + 1).join("\n    at ");

    return error;
  }

  return path.hub.buildError(
    path.node,
    `Modifier "${modifierName}" failed: ${err}`
  );
}

