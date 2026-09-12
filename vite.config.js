import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // build stamp shown in the UI — lets us verify which bundle a browser is running
  define: {
    __BUILD_ID__: JSON.stringify(new Date().toISOString().slice(0, 16).replace('T', ' ') + 'Z')
  },
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true
  }
});
