import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Usamos el plugin de Vite para Tailwind 4
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react()]
});
