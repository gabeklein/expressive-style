import ts from "typescript/lib/tsserverlibrary";

let logger: ts.server.Logger | undefined;

export function setLogger(next: ts.server.Logger) {
  logger = next;
}

export function log(message: string) {
  logger && logger.info(message);
}
