import { expect, it } from "vitest";
import { parser } from "./adapter";

it("will apply hover pseudo class", async () => {
  const output = await parser(`
    const Component = () => {
      if(':hover')
        color: red;

      return <div>Hello</div>
    }
  `);

  expect(output.code).toMatchInlineSnapshot(`
    const _concat = (...args) => args.filter(Boolean).join(' ');
    const Component = (props) => {
      return (
        <div className={_concat(props.className, 'Component_2bb')}>
          Hello
        </div>
      );
    };
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .Component_2bb:hover {
      color: red;
    }
  `);
});

it("will apply hover pseudo class with nested", async () => {
  const output = await parser(`
    const Component = () => {
      color: red;
    
      if(":after"){
        content: " World!";
      }
    
      if(".active"){
        color: blue;
        
        if(":after")
          color: green
      }
    
      return (
        <div>
          Hello
        </div>
      )
    }
  `);

  expect(output.code).toMatchInlineSnapshot(`
    const _concat = (...args) => args.filter(Boolean).join(' ');
    const Component = (props) => {
      return (
        <div className={_concat(props.className, 'Component_2id')}>
          Hello
        </div>
      );
    };
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .Component_2id {
      color: red;
    }
    .Component_2id:after {
      content:  World!;
    }
    .Component_2id.active {
      color: blue;
    }
    .Component_2id.active:after {
      color: green;
    }
  `);
});
