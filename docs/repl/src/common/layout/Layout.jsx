import { Provider } from "@expressive/react";
import { Control } from "./Control";

export const Layout = Control.as((props, self) => {
  const { output, container } = self;

  grid: {
    display: grid;
  }

  return <div _grid ref={container}>{output}</div>;
});

export const Row = (props) => <Layout row separator={Handle} {...props} />;

export const Column = (props) => <Layout separator={Handle} {...props} />;

export { Column as Col };

const Handle = ({ grab, pull, push, vertical, width }) => {
  position: relative;

  bar: {
    position: absolute;
    radius: round;
    transition: "background 0.1s ease-out";
    background: 0xFFFFFF03;

    if(":hover") bg: $accentLight;
  }

  if (vertical) {
    cursor: "col-resize";
    bar: {
      top: 10;
      bottom: 10;
      right: 3;
      left: 3;
    }
  } else {
    cursor: "row-resize";
    bar: {
      top: 3;
      bottom: 3;
      right: 10;
      left: 10;
    }
  }

  return (
    <div onMouseDown={grab}>
      <div _bar />
      <Corner onMouseDown={pull} style={{ left: -width, top: 0 }} />
      <Corner onMouseDown={push} style={{ right: -width, bottom: 0 }} />
    </div>
  );
};

const Corner = (props) => {
  position: absolute;
  cursor: move;
  radius: round;
  size: 9;
  borderColor: transparent;
  borderStyle: solid;
  zIndex: 10;

  if (":hover") borderColor: $accentLight;

  if (!props.onMouseDown) return null;

  return <div />;
};
