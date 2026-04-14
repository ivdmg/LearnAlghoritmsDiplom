import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Тот же origin, что и Vite — без CORS; удобно с IP/эмулятором (не только localhost:3001).
      '/content-api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/content-api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react/jsx-dev-runtime'],
          // Router
          'router-vendor': ['react-router-dom'],
          // State management
          'state-vendor': ['@reduxjs/toolkit', 'react-redux'],
          // UI library — отдельно, чтобы кэшировался
          'antd-vendor': ['antd'],
          // Icons — отдельно (большой пакет)
          'icons-vendor': ['@ant-design/icons'],
          // Animations — используется повсеместно
          'motion-vendor': ['framer-motion'],
          // Charts — только для страниц статистики
          'charts-vendor': ['recharts'],
          // React Flow — только для roadmap
          'flow-vendor': ['@xyflow/react'],
          // CodeMirror — только для страниц задач
          'editor-vendor': ['@uiw/react-codemirror', '@codemirror/lang-python'],
          // Lucide icons — tree-shakeable, но в отдельном чанке
          'lucide-vendor': ['lucide-react'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['antd', '@ant-design/icons', 'framer-motion', 'recharts', '@xyflow/react'],
  },
})
