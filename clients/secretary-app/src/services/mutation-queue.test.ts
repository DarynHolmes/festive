// The /auto suffix patches global indexedDB, IDBDatabase, etc. with
// in-memory implementations so idb's openDB hits the fake, not a real browser.
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  enqueueMutation,
  getAllMutations,
  removeMutation,
  getQueuedMemberIds,
  clearQueue,
  type QueuedDiningMutation,
} from './mutation-queue';

function makeMutation(
  overrides: Partial<Omit<QueuedDiningMutation, 'id'>> = {},
): Omit<QueuedDiningMutation, 'id'> {
  return {
    memberId: 'mem_001',
    diningRecordId: 'din_001',
    lodgeId: 'lodge_001',
    newStatus: 'dining',
    queuedAt: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(async () => {
  await clearQueue();
});

describe('mutation-queue', () => {
  it('enqueues and retrieves a mutation', async () => {
    await enqueueMutation(makeMutation());

    const all = await getAllMutations();
    expect(all).toHaveLength(1);
    expect(all[0]!.memberId).toBe('mem_001');
    expect(all[0]!.newStatus).toBe('dining');
    expect(all[0]!.id).toBeTypeOf('number');
  });

  it('collapses: second mutation for same memberId replaces the first', async () => {
    await enqueueMutation(makeMutation({ newStatus: 'dining' }));
    await enqueueMutation(makeMutation({ newStatus: 'not_dining' }));

    const all = await getAllMutations();
    expect(all).toHaveLength(1);
    expect(all[0]!.newStatus).toBe('not_dining');
  });

  it('preserves mutations for different memberIds', async () => {
    await enqueueMutation(makeMutation({ memberId: 'mem_001' }));
    await enqueueMutation(makeMutation({ memberId: 'mem_002' }));

    const all = await getAllMutations();
    expect(all).toHaveLength(2);
  });

  it('removeMutation removes only the targeted entry', async () => {
    await enqueueMutation(makeMutation({ memberId: 'mem_001' }));
    await enqueueMutation(makeMutation({ memberId: 'mem_002' }));

    const all = await getAllMutations();
    await removeMutation(all[0]!.id!);

    const remaining = await getAllMutations();
    expect(remaining).toHaveLength(1);
    expect(remaining[0]!.memberId).toBe('mem_002');
  });

  it('getQueuedMemberIds returns the correct set', async () => {
    await enqueueMutation(makeMutation({ memberId: 'mem_001' }));
    await enqueueMutation(makeMutation({ memberId: 'mem_002' }));

    const ids = await getQueuedMemberIds();
    expect(ids).toEqual(new Set(['mem_001', 'mem_002']));
  });

  it('clearQueue empties the store', async () => {
    await enqueueMutation(makeMutation({ memberId: 'mem_001' }));
    await enqueueMutation(makeMutation({ memberId: 'mem_002' }));

    await clearQueue();

    const all = await getAllMutations();
    expect(all).toHaveLength(0);
  });
});
