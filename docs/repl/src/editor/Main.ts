import State, { get, use } from "@expressive/react";
import { Editor } from "@docs/editor";

import { Document } from "./Document";

declare global {
  interface Window {
    editor: Main;
  }
}

declare namespace Main {
  type Layout = "compact" | "fill" | "code" | "view";
}

class Main extends State {
  document = use(Document);
  editors = get(Editor, true);

  fontSize = 15;
  layout: Main.Layout = "compact";
  
  options = {
    output: "jsx",
    printStyle: "pretty",
  };
}

export { Main };
