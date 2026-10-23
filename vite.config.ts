import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    build: {
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),
                'tools/json': path.resolve(__dirname, 'tools/json/index.html'),
                'tools/timestamp': path.resolve(__dirname, 'tools/timestamp/index.html'),
                'tools/jwt': path.resolve(__dirname, 'tools/jwt/index.html'),
                'tools/codec': path.resolve(__dirname, 'tools/codec/index.html'),
                'tools/regex': path.resolve(__dirname, 'tools/regex/index.html')
            },
            output: {
                manualChunks: {
                    vendor: ['vue', 'pinia', '@vueuse/core'],
                    icons: ['lucide-vue-next'],
                    crypto: ['crypto-js']
                }
            }
        }
    },
    test: {
        environment: 'happy-dom'
    }
})
