import { expect, it } from "vitest";

import { bundle } from "./adapter";

it("will do", async () => {
  const files = await bundle(`
    export const Hello = () => {
      color: red;

      return <div>Hello!</div>
    };

    Hello();
  `);

  expect(files).toMatchInlineSnapshot(`
    /** assets/index-8qXBdxgs.css **/
    .Hello_28b {
      color: red;
    }
    /*$vite$:1*/

    /** assets/index-CpbWvC1F.js **/
    import "vite/modulepreload-polyfill";
    const l = (...e) => e.filter(Boolean).join(" "),
      o = e => React.createElement("div", {
        className: l(e.className, "Hello_28b")
      }, "Hello!");
    o();
  `);
});

it("will import polyfill", async () => {
  const files = await bundle(`
    export const Hello = () => {
      color: red;

      also: {
        background: blue;
      }

      return (
        <div _also>
          Hello!
        </div>
      )
    };

    Hello();
  `);

  expect(files).toMatchInlineSnapshot(`
    /** assets/index-DdkFSVUL.css **/
    .Hello_28b {
      color: red;
    }
    .also_i3c {
      background: #00f;
    }
    /*$vite$:1*/

    /** assets/index-nxU93rcT.js **/
    import "vite/modulepreload-polyfill";
    const l = (...e) => e.filter(Boolean).join(" "),
      o = e => React.createElement("div", {
        className: l(e.className, "also_i3c Hello_28b")
      }, "Hello!");
    o();
  `);
});
