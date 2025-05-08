import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 8080
  },
  resolve: {
    alias: {
      'firebase/app': 'firebase/app',
      'firebase/auth': 'firebase/auth',
      'firebase/firestore': 'firebase/firestore'
    }
  }
}); 