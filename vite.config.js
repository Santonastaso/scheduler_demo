import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'
  
  return {
    plugins: [react()],
    base: isDev ? '/' : '/scheduler_demo/', // Use root for dev, /scheduler_demo/ for production
    server: {
      // Ensure dev server works correctly
      port: 5174,
      host: true,
    },
    resolve: {
      // Ensure single React instance to prevent hook conflicts
      dedupe: ['react', 'react-dom', '@tanstack/react-query'],
      alias: {
        // Force all React imports to use the same instance
        'react': path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
        // Ensure React Query uses the same instance
        '@tanstack/react-query': path.resolve(__dirname, 'node_modules/@tanstack/react-query'),
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        external: [],
        output: {
          // Ensure React Query context is preserved by keeping it in the main chunk
          manualChunks: (id) => {
            // Keep React Query in the main chunk to preserve context
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-react-query';
            }
            // Keep React in the main chunk
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            // Keep shared package in main chunk to preserve context
            if (id.includes('@santonastaso/shared')) {
              return 'vendor-shared';
            }
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      }
    }
  }
})