import { describe, it, expect } from 'vitest';
import { memberEntrySchema } from './member-entry';

describe('memberEntrySchema', () => {
  it('accepts valid dining entry', () => {
    const result = memberEntrySchema.safeParse({
      memberId: 'mem_001',
      status: 'dining',
    });

    expect(result.success).toBe(true);
  });

  it('accepts all valid status values', () => {
    const statuses = ['dining', 'not_dining', 'undecided'] as const;

    for (const status of statuses) {
      const result = memberEntrySchema.safeParse({
        memberId: 'mem_001',
        status,
      });
      expect(result.success).toBe(true);
    }
  });

  it('rejects missing memberId', () => {
    const result = memberEntrySchema.safeParse({ status: 'dining' });

    expect(result.success).toBe(false);
  });

  it('rejects empty memberId', () => {
    const result = memberEntrySchema.safeParse({
      memberId: '',
      status: 'dining',
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid status', () => {
    const result = memberEntrySchema.safeParse({
      memberId: 'mem_001',
      status: 'maybe',
    });

    expect(result.success).toBe(false);
  });

  it('rejects missing status', () => {
    const result = memberEntrySchema.safeParse({ memberId: 'mem_001' });

    expect(result.success).toBe(false);
  });
});
