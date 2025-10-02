import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		fs: {
			// Allow serving files from the static directory
			allow: ['static']
		}
	},
	build: {
		// Ensure service worker and manifest are included in the build
		assetsInlineLimit: 0,
	}
});
