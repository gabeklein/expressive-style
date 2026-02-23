import withExpressive from "./src";

export default withExpressive()({
  webpack: (config: any) => {
    config.cache = false;
    return config;
  }
});
