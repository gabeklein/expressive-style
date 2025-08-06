import { expect, it } from "vitest";

import { bundle } from "./adapter";

it("will do", async () => {
  const files = await bundle(`  
    export const Hello = () => {
      color: red;
      
      <this>Hello!</this>
    };

    Hello();
  `);

  expect(files).toMatchInlineSnapshot(`
    /** assets/index-WTvIwzMV.css **/
    .Hello_2cs {
      color: red;
    }

    /** assets/index-MxyeXaCG.js **/
    import "vite/modulepreload-polyfill";
    const l = (...e) => e.filter(Boolean).join(" "),
      s = e => React.createElement("div", {
        className: l(e.className, "Hello_2cs")
      }, "Hello!");
    s();
  `);
});

it("will import polyfill", async () => {
  const files = await bundle(`  
    export const Hello = () => {
      color: red;

      also: {
        background: blue;
      }
      
      <this also>
        Hello!
      </this>
    };

    Hello();
  `);

  expect(files).toMatchInlineSnapshot(`
    /** assets/index-_9M7wfUX.css **/
    .Hello_2cs {
      color: red;
    }
    .also_i3c {
      background: #00f;
    }

    /** assets/index-Bix2u0kR.js **/
    import "vite/modulepreload-polyfill";
    const l = (...e) => e.filter(Boolean).join(" "),
      s = e => React.createElement("div", {
        className: l(e.className, "Hello_2cs also_i3c")
      }, "Hello!");
    s();
  `);
});
