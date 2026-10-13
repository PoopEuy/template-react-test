import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import autoprefixer from 'autoprefixer'

export default defineConfig(() => {
  return {
    base: '/',  // Use absolute path for proper SPA routing
    build: {
      outDir: 'build',
      // Disable minification untuk testing (temporary)
      minify: false,
      // Keep console for debugging
      // esbuild: {
      //   drop: ['console', 'debugger'],
      // },
      // CSS code splitting untuk parallel loading
      cssCodeSplit: true,
      // Enable source maps untuk debugging
      sourcemap: true,
      // Rollup options untuk advanced optimization
      rollupOptions: {
        output: {
          // Manual chunks - simplified to avoid dependency issues
          manualChunks: {
            // Keep React together (IMPORTANT - don't split React internals)
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            // CoreUI components
            'vendor-coreui': ['@coreui/react', '@coreui/coreui'],
            // Heavy libraries
            'vendor-heavy': ['jquery', 'chart.js'],
          },
          // Optimized file naming untuk better caching
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
      // Target modern browsers untuk smaller bundles
      target: 'es2015',
      // Chunk size warning
      chunkSizeWarningLimit: 500,
    },
    css: {
      postcss: {
        plugins: [
          autoprefixer({}), // add options if needed
        ],
      },
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
    optimizeDeps: {
      force: true,
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: [
        {
          find: 'src/',
          replacement: `${path.resolve(__dirname, 'src')}/`,
        },
      ],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss'],
    },
    server: {
      allowedHosts: ['kwh.sundaya.local'],
      host: '0.0.0.0',
      port: 3000,
      proxy: {
        // https://vitejs.dev/config/server-options.html
      },
    },
  }
})
