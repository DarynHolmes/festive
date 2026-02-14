import PocketBase from 'pocketbase';

const pocketbaseUrl = import.meta.env.VITE_POCKETBASE_URL;

if (!pocketbaseUrl) {
  throw new Error(
    'VITE_POCKETBASE_URL is not defined. ' +
      'Copy .env.example to .env.development and set the PocketBase URL.',
  );
}

/** Singleton PocketBase client instance. */
export const pb = new PocketBase(pocketbaseUrl);
