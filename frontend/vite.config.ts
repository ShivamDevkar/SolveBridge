import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/")) {
            if (
              id.includes("/react/") ||
              id.includes("/react-dom/") ||
              id.includes("/react-router-dom/")
            ) {
              return "react";
            }

            if (
              id.includes("/lucide-react/") ||
              id.includes("/clsx/") ||
              id.includes("/tailwind-merge/")
            ) {
              return "ui";
            }
          }

          if (id.includes("/src/pages/auth/")) return "auth-pages";
          if (id.includes("/src/pages/admin/")) return "admin-pages";
          if (id.includes("/src/pages/customer/")) return "customer-pages";
          if (id.includes("/src/pages/professional/"))
            return "professional-pages";
          if (id.includes("/src/pages/job/")) return "job-pages";
          if (id.includes("/src/pages/public/")) return "public-pages";
        },
      },
    },
  },
});
