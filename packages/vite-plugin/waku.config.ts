import react from '@vitejs/plugin-react';
import { defineConfig } from 'waku/config';

import stylePlugin from './src';

export default defineConfig({
  srcDir: 'test',
  vite: {
    plugins: [stylePlugin(), react()],
  },
});
