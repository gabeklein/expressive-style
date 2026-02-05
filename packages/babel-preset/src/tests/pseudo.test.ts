import { expect, it } from "vitest";
import { parser } from "./adapter";

it("will apply hover pseudo class", async () => {
  const output = await parser(`
    const Component = () => {
      if(':hover')
        color: red;

      return <div />
    }
  `);

  expect(output.code).toMatchInlineSnapshot(`
    const Component = (props) => {
      return (
        <div className={_concat(props.className, 'Component_2bb')} />
      );
    };
  `);

  expect(output.css).toMatchInlineSnapshot(`
    .Component_2bb:hover {
      color: red;
    }
  `);
});

it("will replace & with parent selector", async () => {
  const output = await parser(`
    const Component = () => {
      color: red;

      if("&:hover")
        color: blue;

      return <div />
    }
  `);

  expect(output.code).toMatchInlineSnapshot(`
    const Component = (props) => {
      return (
        <div className={_concat(props.className, 'Component_28p')} />
      );
    };
  `);
  expect(output.css).toMatchInlineSnapshot(`
    .Component_28p {
      color: red;
    }
    .Component_28p:hover {
      color: blue;
    }
  `);
});

it("will replace & in child combinator", async () => {
  const output = await parser(`
    const Component = () => {
      color: red;

      if("& > span")
        color: green;

      return <div />
    }
  `);

  expect(output.code).toMatchInlineSnapshot(`
    const Component = (props) => {
      return (
        <div className={_concat(props.className, 'Component_2ic')} />
      );
    };
  `);
  expect(output.css).toMatchInlineSnapshot(`
    .Component_2ic {
      color: red;
    }
    .Component_2ic > span {
      color: green;
    }
  `);
});

it("will replace & as descendant target", async () => {
  const output = await parser(`
    const Component = () => {
      color: red;

      if(".wrapper &")
        color: green;

      return <div />
    }
  `);

  expect(output.code).toMatchInlineSnapshot(`
    const Component = (props) => {
      return (
        <div className={_concat(props.className, 'Component_23e')} />
      );
    };
  `);
  expect(output.css).toMatchInlineSnapshot(`
    .Component_23e {
      color: red;
    }
    .wrapper .Component_23e {
      color: green;
    }
  `);
});

it("will replace & nested inside a label", async () => {
  const output = await parser(`
    const Component = () => {
      inner: {
        color: red;

        if("& + &")
          color: blue;
      }

      return <div _inner />
    }
  `);

  expect(output.code).toMatchInlineSnapshot(`
    const Component = (props) => {
      return (
        <div className={_concat(props.className, 'inner_tla')} />
      );
    };
  `);
  expect(output.css).toMatchInlineSnapshot(`
    .inner_tla {
      color: red;
    }
    .inner_tla + .inner_tla {
      color: blue;
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
