import { expect, it } from "vitest";
import { parser } from "./adapter";

it("should throw error for implicit JSX return", async () => {
  await expect(async () => {
    await parser(`
      function Component(){
        <div>Hello</div>
      }
    `);
  }).rejects.toThrow();
});

it("will optimize arrow expression", async () => {
  const output = await parser(`
    const Component = () => {
      return <div>Hello</div>
    }
  `);

  expect(output.code).toMatchInlineSnapshot(`
    const Component = (props) => {
      return <div className={props.className}>Hello</div>;
    };
  `);
});

it("will not optimize with statements", async () => {
  const output = await parser(`
    const Component = () => {
      const name = "World";

      return <div>Hello {name}</div>
    }
  `);

  expect(output.code).toMatchInlineSnapshot(`
    const Component = (props) => {
      const name = 'World';
      return <div className={props.className}>Hello {name}</div>;
    };
  `);
});

it("will combine if 'this' is styled", async () => {
  const output = await parser(`
    function Component(){
      color: red;

      inner: {
        color: blue;
      }

      thing: {
        fontStyle: italic;
      }

      return (
        <div _inner>
          <div _thing>Hello</div>
        </div>
      )
    }
  `);

  expect(output.code).toMatchInlineSnapshot(`
    function Component(props) {
      return (
        <div
          className={_concat(
            props.className,
            'inner_tla Component_2cj'
          )}>
          <div className="thing_tla">Hello</div>
        </div>
      );
    }
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .Component_2cj {
      color: red;
    }
    .inner_tla {
      color: blue;
    }
    .thing_tla {
      font-style: italic;
    }
  `);
});

it.skip("will not race normal jsx plugin", async () => {
  const parse = parser({}, [
    [
      "@babel/plugin-transform-react-jsx",
      {
        useBuiltIns: true,
      },
    ],
  ]);

  const output = await parse(`
    export const Hi = () => {
      color: red;
      fontSize: 2.0;
    
      return <div>Hello World!</div>
    }
  `);

  expect(output.code).toMatchInlineSnapshot(`
    export const Hi = (props) =>
      /*#__PURE__*/ React.createElement(
        'div',
        Object.assign({}, props, {
          className: classNames(props.className, 'Hi_192')
        }),
        'Hello World!'
      );
  `);
});
