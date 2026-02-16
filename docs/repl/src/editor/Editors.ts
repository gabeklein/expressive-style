import { get } from "@expressive/react";
import {
  command,
  Editor,
  editor,
  jsx,
  cssInJsx,
  readOnly,
} from "@docs/editor";

import { Main } from "./Main";

export class InputEditor extends Editor {
  main = get(Main, (main) => {
    main.document.get((doc) => {
      this.text = doc.input;
    });
  });

  extends() {
    return [
      jsx,
      editor,
      command({
        "=": () => {
          this.main.fontSize++;
        },
        "-": () => {
          this.main.fontSize--;
        },
        s: () => {
          this.main.document.build(this.text);
        },
      }),
    ];
  }
}

export class OutputJSX extends Editor {
  main = get(Main, (main) => {
    main.document.get((doc) => {
      this.text = doc.output;
    });
  });

  extends() {
    return [cssInJsx, readOnly];
  }
}
