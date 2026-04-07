import { expect, it } from "vitest";

import { bundle } from "./adapter";

it("will generate css asset", async () => {
  const files = await bundle(`
    export const Hello = () => {
      hi: {
        color: red;
        fontSize: 2.0;
      }

      return (
        <div>
          <div _hi>Hello!</div>
        </div>
      )
    };

    Hello();
  `);

  expect(files).toMatchInlineSnapshot(`
    /** assets/index-52hSgm6E.css **/
    .hi_i3c {
      color: red;
      font-size: 2;
    }
    /*$vite$:1*/

    /** assets/index-B3Kz8xRN.js **/
    import "vite/modulepreload-polyfill";
    const a = e => React.createElement("div", {
      className: e.className
    }, React.createElement("div", {
      className: "hi_i3c"
    }, "Hello!"));
    a();
  `);
});

it("will import concat helper", async () => {
  const files = await bundle(`
    export const Hello = () => {
      color: red;

      return <div>Hello!</div>;
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

it("will generate and import css module", async () => {
  const files = await bundle(`
    export const Hello = () => {
      color: red;

      return <div>Hello!</div>;
    };

    Hello();
  `, {
    cssModules: true
  });

  expect(files).toMatchInlineSnapshot(`
    /** assets/index-Cajvt0uw.css **/
    ._Hello_28b_1goqq_1 {
      color: red;
    }
    /*$vite$:1*/

    /** assets/index-Ca9W-Jti.js **/
    import "vite/modulepreload-polyfill";
    const e = "_Hello_28b_1goqq_1",
      o = {
        Hello_28b: e
      },
      c = (...l) => l.filter(Boolean).join(" "),
      t = l => React.createElement("div", {
        className: c(l.className, o.Hello_28b)
      }, "Hello!");
    t();
  `);
});