import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

export default defineConfig((env) =>
  mergeConfig(viteConfig({ ...env, mode: 'test' }), {
    test: {
      include: ['tests/unit/**/*.test.ts', 'tests/content/**/*.test.ts', 'tests/fasit/**/*.test.ts'],
      environment: 'node',
      setupFiles: ['tests/oppsett.ts'],
    },
  }),
);
