import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	base: "/yodasbasket/",
	plugins: [
		react(),
		tailwindcss(),
		VitePWA({
			registerType: "prompt",
			includeAssets: ["favicon.ico", "icons/*.png"],
			manifest: {
				name: "YodasBasket",
				short_name: "YodasBasket",
				description: "Offline-first meal planning and shopping list app",
				theme_color: "#16a34a",
				background_color: "#ffffff",
				display: "standalone",
				scope: "/yodasbasket/",
				start_url: "/yodasbasket/",
				icons: [
					{
						src: "icons/icon-192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "icons/icon-512.png",
						sizes: "512x512",
						type: "image/png",
					},
				],
			},
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
			},
		}),
	],
});
