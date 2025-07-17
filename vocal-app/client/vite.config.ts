// client/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- Import plugin mới

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- Thêm plugin vào đây
  ],
  // Xóa toàn bộ phần 'server.proxy' đi nếu có
})