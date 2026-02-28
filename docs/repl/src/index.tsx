import ReactDOM from 'react-dom/client';

import Window from './common/window';
import Interface from './App';

window.addEventListener("load", () => {
  const container = document.getElementById('react-root')!;
  ReactDOM.createRoot(container).render(
    <Window>
      <Interface />
    </Window>
  );
});