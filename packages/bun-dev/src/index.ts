import type { Serve } from "bun";

export type AppConfig = Omit<Serve, "development" | "fetch" | "websocket"> & {
  fetch?: Serve["fetch"];
  websocket?: Serve["websocket"];
};

export function defineApp(config: AppConfig): AppConfig {
  return config;
}
