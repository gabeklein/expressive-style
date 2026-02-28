import "./styles.css";

import { Provider } from "@expressive/react";

import { Col, Row } from "./common/layout/Layout";
import { InputEditor, OutputJSX } from "./editor/Editors";
import { Main } from "./editor/Main";
import { Preview } from "./editor/Preview";

const App: React.FC = () => (
  <Provider for={Main}>
    <Row>
      <Col>
        <InputEditor />
        <OutputJSX />
      </Col>
      <Preview />
    </Row>
  </Provider>
);

export default App;