import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

export default defineConfig((env) =>
  mergeConfig(viteConfig({ ...env, mode: 'test' }), {
    test: {
      include: ['tests/unit/**/*.test.ts', 'tests/content/**/*.test.ts', 'tests/fasit/**/*.test.ts'],
      environment: 'node',
      setupFiles: ['tests/oppsett.ts'],
      // Mange tester leser alle innholdsfilene eller dataene. På en maskin med fire kjerner kan de bruke over 5 s
      // (standard) når alle kjører samtidig. Tester som lager hele rapporter, har egen, lengre grense (avgjørelse 097).
      testTimeout: 15_000,
    },
  }),
);
