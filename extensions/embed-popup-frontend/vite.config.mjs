import { defineConfig } from 'vite'
import shopify from 'vite-plugin-shopify'
import react from '@vitejs/plugin-react'
import path from "path";

export default defineConfig({
    root: path.resolve(__dirname, ''),
    plugins: [
        shopify({
            themeRoot: path.resolve(__dirname, ''),
            sourceCodeDir: path.resolve(__dirname, 'frontend'),
            entrypointsDir: path.resolve(__dirname, 'frontend/entrypoints'),
            snippetFile: 'vite-tag.liquid',
        }),
        react(),
    ],
    build: {
        outDir: path.resolve(__dirname, 'assets'),
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'frontend/entrypoints/theme.jsx'),
            },
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom'],
                },
            },
        },
    },
})
