import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  return {
    plugins: [react()],
    server: {
      port: 5000,
      proxy: {
        '/api/bedrock': {
          target: env.VITE_OPENAI_BASE_URL || 'https://bedrock-mantle.eu-north-1.api.aws/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/bedrock/, ''),
          headers: {
            'Authorization': `Bearer ${env.VITE_OPENAI_API_KEY || ''}`,
          },
        },
      },
    },
  }
})
