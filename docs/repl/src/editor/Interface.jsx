import { Col, Row } from "../common/layout/Layout";

import { InputEditor, OutputJSX } from "./Editors";
import { Provider } from "@expressive/react";
import { Main } from "./Main";
import { Preview } from "./Preview";

export const Input = InputEditor.as((_, p) => <div ref={p.ref} />);
export const Output = OutputJSX.as((_, p) => <div ref={p.ref} />);

export const Interface = () => (
  <Provider for={{ Main }}>
    <Row>
      <Col>
        <Input />
        <Output />
      </Col>
      <Preview />
    </Row>
  </Provider>
)