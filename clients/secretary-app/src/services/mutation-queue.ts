import { openDB, type IDBPDatabase } from 'idb';
import type { DiningStatus } from './types';

export interface QueuedDiningMutation {
  id?: number;
  memberId: string;
  diningRecordId: string | null;
  lodgeId: string;
  newStatus: DiningStatus;
  queuedAt: string;
}

const DB_NAME = 'festive-board-queue';
const DB_VERSION = 1;
const STORE_NAME = 'dining-mutations';
const IDX_BY_MEMBER = 'by-member';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Guard allows future schema migrations: bump DB_VERSION, add
        // migration logic here without recreating an existing store.
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex(IDX_BY_MEMBER, 'memberId');
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Enqueue a dining mutation. Collapses intermediate toggles:
 * if a mutation for the same memberId already exists, it is replaced
 * so only the final toggle survives.
 */
export async function enqueueMutation(
  mutation: Omit<QueuedDiningMutation, 'id'>,
): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const index = tx.store.index(IDX_BY_MEMBER);

  const existingKey = await index.getKey(mutation.memberId);
  if (existingKey !== undefined) {
    await tx.store.delete(existingKey);
  }

  await tx.store.add(mutation);
  await tx.done;
}

/** Get all queued mutations, oldest first. */
export async function getAllMutations(): Promise<QueuedDiningMutation[]> {
  const db = await getDb();
  return db.getAll(STORE_NAME);
}

/** Remove a specific mutation by its auto-generated ID. */
export async function removeMutation(id: number): Promise<void> {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
}

/** Get the set of memberIds currently in the queue. */
export async function getQueuedMemberIds(): Promise<Set<string>> {
  const db = await getDb();
  const all = await db.getAll(STORE_NAME);
  return new Set(all.map((m) => m.memberId));
}

/** Clear the entire queue. */
export async function clearQueue(): Promise<void> {
  const db = await getDb();
  await db.clear(STORE_NAME);
}

