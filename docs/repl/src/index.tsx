import "./styles.css";

import { Provider } from "@expressive/react";

import { Col, Row } from "./common/layout/Layout";
import { InputEditor, OutputJSX } from "./editor/Editors";
import { Main } from "./editor/Main";
import { Preview } from "./editor/Preview";

const Input = InputEditor.as({});
const Output = OutputJSX.as({});

const App: React.FC = () => (
  <Provider for={Main}>
    <Row>
      <Col>
        <Input />
        <Output />
      </Col>
      <Preview />
    </Row>
  </Provider>
);

export default App;