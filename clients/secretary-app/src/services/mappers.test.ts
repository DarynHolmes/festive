import { describe, it, expect } from 'vitest';
import { toLodge, toDiningEntry, toMember, mergeMembersWithDining } from './mappers';
import type { LodgeRecord, DiningRecord, MemberRecord } from './types';
import type { Member, DiningEntry } from './types';

function makeLodgeRecord(
  overrides: Partial<LodgeRecord> = {},
): LodgeRecord {
  return {
    id: 'lodge_001',
    name: 'Lodge of Harmony No. 255',
    province: 'Metropolitan',
    meeting_location: 'Freemasons Hall, London',
    collectionId: 'pbc_3403674053',
    collectionName: 'lodges',
    created: '2026-01-01T00:00:00Z',
    updated: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeDiningRecord(
  overrides: Partial<DiningRecord> = {},
): DiningRecord {
  return {
    id: 'din_001',
    lodge_id: 'lodge_001',
    member_id: 'mem_001',
    meeting_date: '2026-03-15T00:00:00Z',
    status: 'dining',
    updated_by: 'mem_001',
    collectionId: 'pbc_2053535107',
    collectionName: 'dining_records',
    created: '2026-01-01T00:00:00Z',
    updated: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('toLodge', () => {
  it('maps PocketBase record fields to camelCase domain object', () => {
    const lodge = toLodge(makeLodgeRecord());

    expect(lodge).toEqual({
      id: 'lodge_001',
      name: 'Lodge of Harmony No. 255',
      province: 'Metropolitan',
      meetingLocation: 'Freemasons Hall, London',
    });
  });

  it('strips PocketBase metadata (collectionId, created, updated)', () => {
    const lodge = toLodge(makeLodgeRecord());

    expect(lodge).not.toHaveProperty('collectionId');
    expect(lodge).not.toHaveProperty('collectionName');
    expect(lodge).not.toHaveProperty('created');
    expect(lodge).not.toHaveProperty('updated');
  });

  it('handles empty meeting_location', () => {
    const lodge = toLodge(makeLodgeRecord({ meeting_location: '' }));

    expect(lodge.meetingLocation).toBe('');
  });
});

describe('toDiningEntry', () => {
  it('maps PocketBase record fields to camelCase domain object', () => {
    const entry = toDiningEntry(makeDiningRecord());

    expect(entry).toEqual({
      id: 'din_001',
      lodgeId: 'lodge_001',
      memberId: 'mem_001',
      meetingDate: '2026-03-15T00:00:00Z',
      status: 'dining',
      updatedBy: 'mem_001',
    });
  });

  it('preserves all valid status values', () => {
    const statuses = ['dining', 'not_dining', 'undecided'] as const;

    for (const status of statuses) {
      expect(toDiningEntry(makeDiningRecord({ status })).status).toBe(status);
    }
  });

  it('strips PocketBase metadata', () => {
    const entry = toDiningEntry(makeDiningRecord());

    expect(entry).not.toHaveProperty('collectionId');
    expect(entry).not.toHaveProperty('collectionName');
    expect(entry).not.toHaveProperty('created');
    expect(entry).not.toHaveProperty('updated');
  });
});

// ---------------------------------------------------------------------------
// toMember
// ---------------------------------------------------------------------------

function makeMemberRecord(
  overrides: Partial<MemberRecord> = {},
): MemberRecord {
  return {
    id: 'mem_001',
    lodge_id: 'lodge_001',
    first_name: 'James',
    last_name: 'Whitfield',
    rank: 'W Bro',
    status: 'active',
    collectionId: 'pbc_3572739349',
    collectionName: 'members',
    created: '2026-01-01T00:00:00Z',
    updated: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('toMember', () => {
  it('maps PocketBase record fields to camelCase domain object', () => {
    const member = toMember(makeMemberRecord());

    expect(member).toEqual({
      id: 'mem_001',
      lodgeId: 'lodge_001',
      firstName: 'James',
      lastName: 'Whitfield',
      rank: 'W Bro',
      status: 'active',
    });
  });
});

// ---------------------------------------------------------------------------
// mergeMembersWithDining
// ---------------------------------------------------------------------------

function makeMember(overrides: Partial<Member> = {}): Member {
  return {
    id: 'mem_001',
    lodgeId: 'lodge_001',
    firstName: 'James',
    lastName: 'Whitfield',
    rank: 'W Bro',
    status: 'active',
    ...overrides,
  };
}

function makeDiningEntry(overrides: Partial<DiningEntry> = {}): DiningEntry {
  return {
    id: 'din_001',
    lodgeId: 'lodge_001',
    memberId: 'mem_001',
    meetingDate: '2026-03-15T00:00:00Z',
    status: 'dining',
    updatedBy: 'seed',
    ...overrides,
  };
}

describe('mergeMembersWithDining', () => {
  it('pairs members with their dining records', () => {
    const members = [makeMember()];
    const dining = [makeDiningEntry({ memberId: 'mem_001', status: 'dining' })];

    const rows = mergeMembersWithDining(members, dining);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      memberId: 'mem_001',
      diningRecordId: 'din_001',
      rank: 'W Bro',
      firstName: 'James',
      lastName: 'Whitfield',
      status: 'dining',
    });
  });

  it('defaults to undecided when member has no dining record', () => {
    const members = [makeMember({ id: 'mem_new' })];

    const rows = mergeMembersWithDining(members, []);

    expect(rows[0]!.status).toBe('undecided');
    expect(rows[0]!.diningRecordId).toBeNull();
  });

  it('excludes resigned members', () => {
    const members = [
      makeMember({ id: 'mem_active', status: 'active' }),
      makeMember({ id: 'mem_resigned', status: 'resigned' }),
      makeMember({ id: 'mem_honorary', status: 'honorary' }),
    ];

    const rows = mergeMembersWithDining(members, []);

    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.memberId)).toEqual(['mem_active', 'mem_honorary']);
  });
});
