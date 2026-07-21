import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: { executablePath: '/snap/bin/chromium' },
  },
  webServer: {
    command: 'npm run build -w @platform/web && npm run preview -w @platform/web',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { executablePath: '/snap/bin/chromium' },
      },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['iPhone 13'], launchOptions: { executablePath: '/snap/bin/chromium' } },
    },
  ],
});
