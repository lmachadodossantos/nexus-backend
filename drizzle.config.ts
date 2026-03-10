import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/db/sqlite.ts",
    out: "./drizzle",
    dialect: "sqlite",
    dbCredentials: {
        url: "sqlite.db",
    },
});