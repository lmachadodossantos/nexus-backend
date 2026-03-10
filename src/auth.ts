import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as dbSQLite from "./db/sqlite";

const sqlite = new Database("sqlite.db");
export const db = drizzle(sqlite, { schema: dbSQLite });

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "sqlite",
        schema: dbSQLite
    }),
    emailAndPassword: {
        enabled: true
    },
    logger: {
        level: "debug",
        disabled: false
    }
});