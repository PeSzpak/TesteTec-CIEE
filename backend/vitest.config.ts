import { config } from "dotenv";
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "node",
    env: config({ path: ".env.test" }).parsed,
    fileParallelism: false,
  },
});
