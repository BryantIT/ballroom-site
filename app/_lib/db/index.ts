import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type DbInstance = ReturnType<typeof drizzle<typeof schema>>;

let _instance: DbInstance | undefined;

function getInstance(): DbInstance {
  if (!_instance) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    _instance = drizzle(postgres(url, { prepare: false }), { schema });
  }
  return _instance;
}

// Proxy defers initialization to first use so missing DATABASE_URL at module
// load time (e.g. during build or cold start) doesn't crash the Lambda.
export const db = new Proxy({} as DbInstance, {
  get(_target, prop, receiver) {
    return Reflect.get(getInstance(), prop, receiver);
  },
});
