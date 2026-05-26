export type Loader = "js" | "jsx" | "ts" | "tsx" | "css";

export interface OnResolveArgs {
  path: string;
}

export interface OnLoadArgs {
  path: string;
  loader: string;
}

export interface BunBuild {
  onResolve(
    options: { filter: RegExp; namespace?: string },
    callback: (args: OnResolveArgs) => { path: string; namespace: string } | undefined,
  ): void;
  onLoad(
    options: { filter: RegExp; namespace?: string },
    callback: (args: OnLoadArgs) =>
      | { contents: string; loader: Loader }
      | undefined
      | Promise<{ contents: string; loader: Loader } | undefined>,
  ): void;
}

export interface BunPlugin {
  name: string;
  target?: "browser" | "bun" | "node";
  setup(build: BunBuild): void;
}

