import { NodePath } from "@babel/core";
import * as t from "@babel/types";

export function uniqueIdentifier(path: NodePath, name = "temp") {
  const { scope } = path;
  
  let uid = name;
  let i = 0;

  while (scope.hasLabel(uid) || scope.hasBinding(uid) || scope.hasGlobal(uid)) {
    uid = name + ++i;
  }

  if (i > 1) uid = name + i;

  return t.identifier(uid);
}
