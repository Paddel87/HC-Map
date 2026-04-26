/**
 * RxDB database singleton (browser-only).
 *
 * Lazy-initialised via `getDatabase()` so the heavy RxDB bundle is not
 * pulled in by SSR. Uses the Dexie storage adapter (IndexedDB-backed,
 * per ADR-017) without encryption (ADR-032: keys / app-PIN cover the
 * threat model in Pfad A).
 *
 * The dev-mode plugin is loaded only when `NODE_ENV !== 'production'`;
 * it adds expensive runtime checks that catch schema misuse and is the
 * RxDB-recommended setup for local development.
 */

import { addRxPlugin, createRxDatabase, type RxDatabase, type RxCollection } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";

import { applicationSchema, eventSchema } from "./schemas";
import type { ApplicationDocType, EventDocType } from "./types";

export type EventCollection = RxCollection<EventDocType>;
export type ApplicationCollection = RxCollection<ApplicationDocType>;

export interface HCMapCollections {
  events: EventCollection;
  applications: ApplicationCollection;
}

export type HCMapDatabase = RxDatabase<HCMapCollections>;

const DB_NAME = "hcmap";
let dbPromise: Promise<HCMapDatabase> | null = null;
let devPluginLoaded = false;

async function loadDevPlugin(): Promise<void> {
  if (devPluginLoaded) return;
  // Production strips it for bundle size; vitest skips it because the
  // plugin demands a schema-validator wrapper around the storage that
  // we don't ship in production. Only the interactive `next dev` path
  // (NODE_ENV === "development") loads it.
  if (process.env.NODE_ENV !== "development") return;
  const { RxDBDevModePlugin } = await import("rxdb/plugins/dev-mode");
  addRxPlugin(RxDBDevModePlugin);
  devPluginLoaded = true;
}

async function buildDatabase(): Promise<HCMapDatabase> {
  await loadDevPlugin();
  const db = await createRxDatabase<HCMapCollections>({
    name: DB_NAME,
    storage: getRxStorageDexie(),
    multiInstance: true,
    eventReduce: true,
    ignoreDuplicate: false,
  });
  await db.addCollections({
    events: { schema: eventSchema },
    applications: { schema: applicationSchema },
  });
  return db;
}

/**
 * Resolve the singleton RxDB instance. Calling this on the server is a
 * programming error — IndexedDB doesn't exist there. The provider gates
 * initialisation on the client mount, so callers downstream are safe.
 */
export function getDatabase(): Promise<HCMapDatabase> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("RxDB is browser-only; called from server"));
  }
  if (!dbPromise) {
    dbPromise = buildDatabase().catch((error) => {
      // Reset so the next call can retry from a clean slate.
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}

/** Test helper — drops the cached promise so a fresh DB can be created. */
export function _resetDatabaseForTests(): void {
  dbPromise = null;
}
