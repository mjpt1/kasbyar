import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'packages/shared/**/*.test.ts',
      'apps/web/src/**/*.test.ts',
    ],
    coverage: {
      provider: 'v8',
      include: [
        'packages/shared/src/**/*.ts',
        'apps/web/src/lib/business/**/*.ts',
        'apps/web/src/lib/permissions.ts',
        'apps/web/src/lib/validators/**/*.ts',
      ],
      exclude: ['**/*.test.ts', '**/index.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'apps/web/src'),
      '@kesbyar/shared': path.resolve(__dirname, 'packages/shared/src'),
    },
  },
});
