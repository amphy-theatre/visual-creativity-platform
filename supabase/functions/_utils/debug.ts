export const debug = (namespace: string) => {
  return (...args: unknown[]) => {
    if (Deno.env.get("DEBUG") === "true") {
      console.log(`[${namespace}]`, ...args);
    }
  };
};
