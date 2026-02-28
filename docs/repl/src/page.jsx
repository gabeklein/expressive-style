import ReactDOM from "react-dom/client";

import App from ".";
import Window from "./common/window";

window.addEventListener("load", () => {
  ReactDOM.createRoot(document.body).render(
    <Window>
      <App />
    </Window>,
  );
});
