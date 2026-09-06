import { defineConfig } from 'vite';
import { fillDestinations } from './shared/delivery.js';
export default defineConfig({
  plugins: [{ name: 'delivery-destinations', transformIndexHtml: { order: 'pre', handler: fillDestinations } }],
});
