import base from './playwright.config';
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  ...base,
  projects: [{ name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } }],
});
