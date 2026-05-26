export type AppConfig = Parameters<typeof Bun.serve>[0];

export function defineApp(config: AppConfig): AppConfig {
  return config;
}
