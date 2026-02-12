import { Row } from "common/layout/Layout";
import { Document } from "editor/Document";

import { InputEditor, OutputJSX } from "./Editors";
import { Provider } from "@expressive/react";
import { Main } from "./Main";

export const Interface = () => {
  return (
    <Provider for={{ Main }}>
      <Row>
        <Input />
        <Output />
        <Preview />
      </Row>
    </Provider>
  );
};

export const Input = InputEditor.as((p) => <div ref={p.ref} />);
export const Output = OutputJSX.as((p) => <div ref={p.ref} />);

const Preview = () => {
  const { key, error, onError, Preview } = Document.get();

  flex: 1;
  flexAlign: center;
  border: dashed, 2, $borderLight;
  background: $cmBackgroundDark;
  radius: 8;
  position: relative;
  overflow: hidden;
  color: $cmText;

  issue: {
    color: $red;
  }

  return (
    <div>
      {error ? (
        <issue>{error}</issue>
      ) : Preview ? (
        <Preview key={key} onError={onError} />
      ) : (
        <issue>Waiting for exports...</issue>
      )}
    </div>
  );
};
