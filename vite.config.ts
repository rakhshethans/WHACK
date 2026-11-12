import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  resolve: { alias: { '@': root } },
  build: {
    rolldownOptions: {
      input: {
        world: fileURLToPath(new URL('index.html', import.meta.url)),
        signIn: fileURLToPath(new URL('sign-in.html', import.meta.url)),
      },
    },
  },
});
