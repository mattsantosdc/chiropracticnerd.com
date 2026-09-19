// @ts-check
import { defineConfig } from 'astro/config';

// Keep content caches local when isolated build fixtures share node_modules.
export default defineConfig({ cacheDir: './.astro/cache' });
