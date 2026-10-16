
const { resolve } = require('path');
const { defineConfig } = require('vite');

module.exports = defineConfig({
  base: '/cafe/',

  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
});
