import { onMounted, onUnmounted } from 'vue';
import { pb } from 'src/services/pocketbase';
import { useLodgeStore } from 'stores/lodge-store';
import type { RecordSubscription, RecordModel } from 'pocketbase';

interface UseRealtimeSyncOptions {
  collection: string;
  onEvent?: (event: RecordSubscription<RecordModel>) => void;
}

/**
 * Subscribes to PocketBase realtime events for a collection.
 * Automatically unsubscribes when the component unmounts.
 *
 * Follows the event-based invalidation pattern described in
 * {@link https://tkdodo.eu/blog/using-web-sockets-with-react-query TkDodo — Using WebSockets with React Query}.
 * SSE events invalidate the query cache rather than writing data directly,
 * keeping queries as the single source of truth for server state.
 *
 * @example
 * useRealtimeSync({
 *   collection: 'lodges',
 *   onEvent: (e) => queryCache.invalidateQueries({ key: ['lodges'] }),
 * });
 */
export function useRealtimeSync({
  collection,
  onEvent,
}: UseRealtimeSyncOptions) {
  const lodgeStore = useLodgeStore();
  let unsubscribe: (() => Promise<void>) | null = null;

  async function subscribe() {
    try {
      unsubscribe = await pb.collection(collection).subscribe('*', (event) => {
        console.debug(
          `[Realtime] ${collection}: ${event.action}`,
          event.record,
        );
        onEvent?.(event);
      });
      lodgeStore.setRealtimeConnected(true);
    } catch (error) {
      console.error(
        `[Realtime] Failed to subscribe to ${collection}:`,
        error,
      );
      lodgeStore.setRealtimeConnected(false);
    }
  }

  onMounted(() => {
    void subscribe();
  });

  onUnmounted(() => {
    if (unsubscribe) {
      void unsubscribe();
      unsubscribe = null;
    }
  });

  return { resubscribe: subscribe };
}
