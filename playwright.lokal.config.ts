import grunn from './playwright.config.ts';
export default {
  ...grunn,
  projects: (grunn.projects ?? []).filter((p) => p.name?.startsWith('chromium')).map((p) => ({ ...p, use: { ...p.use, launchOptions: { executablePath: '/opt/pw-browsers/chromium' } } })),
};
