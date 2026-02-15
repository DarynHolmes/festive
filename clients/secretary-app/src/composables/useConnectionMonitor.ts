import { onMounted, onUnmounted } from 'vue';
import { pb } from 'src/services/pocketbase';
import { useLodgeStore } from 'stores/lodge-store';

/** Delay before transitioning from "reconnecting" → "offline" to absorb brief blips. */
const DISCONNECT_DEBOUNCE_MS = 2000;

/** How often to check `pb.realtime.isConnected` while waiting for reconnection. */
const RECONNECT_POLL_MS = 2000;

/** Give up polling for reconnection after this long and fall back to "offline". */
const RECONNECT_POLL_MAX_MS = 30_000;

/**
 * Monitors PocketBase realtime connection lifecycle and browser
 * online/offline events. Drives the global `connectionStatus` state
 * through three phases: connected → reconnecting → offline.
 *
 * **Detection layers (why two?):**
 * - `pb.realtime.onDisconnect` + `PB_CONNECT` subscription — authoritative
 *   SSE-level signals, but the SDK may exhaust its internal reconnect
 *   attempts while the browser is offline, so PB_CONNECT won't fire
 *   when the network returns.
 * - `window` `online`/`offline` events — coarse browser-level signal used
 *   to kick off a reconnect poll that checks `pb.realtime.isConnected`
 *   until the SDK re-establishes the SSE stream.
 *
 * **Debounce:** A 2-second delay before showing "Offline" absorbs
 * transient network blips ("flapping connection" edge case).
 *
 * Call once in MainLayout — do not call per-component.
 */

export function useConnectionMonitor() {
  const lodgeStore = useLodgeStore();
  let disconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectPollTimer: ReturnType<typeof setInterval> | null = null;
  let pbConnectUnsub: (() => Promise<void>) | null = null;

  function markConnected() {
    if (disconnectTimer) {
      clearTimeout(disconnectTimer);
      disconnectTimer = null;
    }
    stopReconnectPoll();
    lodgeStore.setConnectionStatus('connected');
    lodgeStore.setLastSyncedAt(new Date());
  }

  function markDisconnectedDebounced() {
    if (disconnectTimer) return;

    lodgeStore.setConnectionStatus('reconnecting');

    disconnectTimer = setTimeout(() => {
      disconnectTimer = null;
      lodgeStore.setConnectionStatus('offline');
    }, DISCONNECT_DEBOUNCE_MS);
  }

  function stopReconnectPoll() {
    if (reconnectPollTimer) {
      clearInterval(reconnectPollTimer);
      reconnectPollTimer = null;
    }
  }

  /**
   * Poll `pb.realtime.isConnected` after the browser comes back online.
   * PB_CONNECT should fire on reconnection, but the SDK may have
   * exhausted its auto-reconnect attempts while the browser was offline.
   * This poll acts as a reliable fallback.
   */
  function startReconnectPoll() {
    stopReconnectPoll();

    const deadline = Date.now() + RECONNECT_POLL_MAX_MS;

    reconnectPollTimer = setInterval(() => {
      if (pb.realtime.isConnected) {
        markConnected();
        return;
      }
      if (Date.now() > deadline) {
        stopReconnectPoll();
        lodgeStore.setConnectionStatus('offline');
      }
    }, RECONNECT_POLL_MS);
  }

  // When the browser regains network, PocketBase may or may not auto-reconnect
  // (it uses exponential back-off and may have given up). The poll bridges the
  // gap by checking `isConnected` until the SSE stream is back.
  function handleBrowserOnline() {
    if (lodgeStore.connectionStatus !== 'connected') {
      lodgeStore.setConnectionStatus('reconnecting');
      startReconnectPoll();
    }
  }

  function handleBrowserOffline() {
    stopReconnectPoll();
    markDisconnectedDebounced();
  }

  onMounted(async () => {
    // PocketBase SSE lifecycle
    pb.realtime.onDisconnect = (activeSubscriptions) => {
      if (activeSubscriptions.length > 0) {
        markDisconnectedDebounced();
      }
    };

    try {
      pbConnectUnsub = await pb.realtime.subscribe('PB_CONNECT', () => {
        markConnected();
      });
    } catch {
      lodgeStore.setConnectionStatus('offline');
    }

    // Browser online/offline events
    window.addEventListener('online', handleBrowserOnline);
    window.addEventListener('offline', handleBrowserOffline);
  });

  onUnmounted(() => {
    if (disconnectTimer) {
      clearTimeout(disconnectTimer);
      disconnectTimer = null;
    }
    stopReconnectPoll();

    delete pb.realtime.onDisconnect;

    if (pbConnectUnsub) {
      void pbConnectUnsub();
      pbConnectUnsub = null;
    }

    window.removeEventListener('online', handleBrowserOnline);
    window.removeEventListener('offline', handleBrowserOffline);
  });
}
