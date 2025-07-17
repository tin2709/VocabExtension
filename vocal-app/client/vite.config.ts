import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // ===== ĐẢM BẢO KHỐI NÀY TỒN TẠI VÀ CHÍNH XÁC =====
  server: {
    proxy: {
      // Khi client gọi đến /api, chuyển tiếp nó tới server backend
      '/api': {
        target: 'http://localhost:3001', // Port của server Node.js
        changeOrigin: true, // Cần thiết cho các virtual host
        secure: false,      // Không xác thực SSL
      },
    },
  },
  // ===============================================
})