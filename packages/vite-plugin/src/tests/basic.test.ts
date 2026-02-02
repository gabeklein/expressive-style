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
    /** assets/index-BWs382js.css **/
    .Hello_28b {
      color: red;
    }

    /** assets/index-yaol3pMC.js **/
    import "vite/modulepreload-polyfill";
    const l = (...e) => e.filter(Boolean).join(" "),
      a = e => React.createElement("div", {
        className: l(e.className, "Hello_28b")
      }, "Hello!");
    a();
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
    /** assets/index-CKL8FInG.css **/
    .Hello_28b {
      color: red;
    }
    .also_i3c {
      background: #00f;
    }

    /** assets/index-DSp-f72N.js **/
    import "vite/modulepreload-polyfill";
    const l = (...e) => e.filter(Boolean).join(" "),
      a = e => React.createElement("div", {
        className: l(e.className, "also_i3c Hello_28b")
      }, "Hello!");
    a();
  `);
});
