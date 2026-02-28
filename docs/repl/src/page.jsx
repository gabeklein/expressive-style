import ReactDOM from 'react-dom/client';

import App from '.';
import Window from "./common/window";

window.addEventListener("load", () => {
  const container = document.getElementById('react-root');

  ReactDOM.createRoot(container).render(
    <Window>
      <App />
    </Window>
  );
});