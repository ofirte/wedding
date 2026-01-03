import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` (development or production)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react({
        jsxRuntime: 'automatic',
        // Enable emotion for Material-UI
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: ['@emotion/babel-plugin'],
        },
      }),
      tsconfigPaths(),
    ],

    // Resolve aliases (backup to tsconfigPaths)
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@shared': path.resolve(__dirname, './shared'),
        '@wedding-plan/types': path.resolve(__dirname, './shared'),
      },
    },

    // Define global constants for backwards compatibility
    // Maps process.env.REACT_APP_* to VITE_* environment variables
    define: {
      'process.env.REACT_APP_FIREBASE_API_KEY': JSON.stringify(
        env.VITE_FIREBASE_API_KEY || env.REACT_APP_FIREBASE_API_KEY
      ),
      'process.env.REACT_APP_FIREBASE_AUTH_DOMAIN': JSON.stringify(
        env.VITE_FIREBASE_AUTH_DOMAIN || env.REACT_APP_FIREBASE_AUTH_DOMAIN
      ),
      'process.env.REACT_APP_FIREBASE_PROJECT_ID': JSON.stringify(
        env.VITE_FIREBASE_PROJECT_ID || env.REACT_APP_FIREBASE_PROJECT_ID
      ),
      'process.env.REACT_APP_FIREBASE_STORAGE_BUCKET': JSON.stringify(
        env.VITE_FIREBASE_STORAGE_BUCKET || env.REACT_APP_FIREBASE_STORAGE_BUCKET
      ),
      'process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(
        env.VITE_FIREBASE_MESSAGING_SENDER_ID || env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID
      ),
      'process.env.REACT_APP_FIREBASE_APP_ID': JSON.stringify(
        env.VITE_FIREBASE_APP_ID || env.REACT_APP_FIREBASE_APP_ID
      ),
      'process.env.REACT_APP_FIREBASE_MEASUREMENT_ID': JSON.stringify(
        env.VITE_FIREBASE_MEASUREMENT_ID || env.REACT_APP_FIREBASE_MEASUREMENT_ID
      ),
      'process.env.REACT_APP_ENV': JSON.stringify(
        env.VITE_APP_ENV || env.REACT_APP_ENV
      ),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },

    // Build configuration
    build: {
      outDir: 'build', // Keep as 'build' for Firebase compatibility
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor code for better caching
            'vendor-react': ['react', 'react-dom', 'react-router'],
            'vendor-mui': [
              '@mui/material',
              '@mui/icons-material',
              '@mui/lab',
              '@mui/system',
              '@emotion/react',
              '@emotion/styled',
            ],
            'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage', 'firebase/functions'],
            'vendor-query': ['@tanstack/react-query'],
            'vendor-forms': ['react-hook-form'],
            'vendor-dnd': ['react-dnd', 'react-dnd-html5-backend', 'react-dnd-touch-backend'],
          },
        },
      },
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
    },

    // Dev server
    server: {
      port: 3000,
      open: true,
      strictPort: false,
    },

    // Preview server (for testing production builds)
    preview: {
      port: 3000,
    },

    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router',
        '@mui/material',
        '@emotion/react',
        '@emotion/styled',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'firebase/storage',
        'firebase/functions',
      ],
    },
  };
});
