import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatTimeAgo } from './time';

describe('formatTimeAgo', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  function agoMs(ms: number): Date {
    return new Date(Date.now() - ms);
  }

  it('returns "just now" for timestamps under 30 seconds ago', () => {
    expect(formatTimeAgo(agoMs(0))).toBe('just now');
    expect(formatTimeAgo(agoMs(29_000))).toBe('just now');
  });

  it('returns singular minute for 30s–119s', () => {
    expect(formatTimeAgo(agoMs(30_000))).toBe('1 minute ago');
    expect(formatTimeAgo(agoMs(60_000))).toBe('1 minute ago');
    expect(formatTimeAgo(agoMs(119_000))).toBe('1 minute ago');
  });

  it('returns plural minutes for 2–59 minutes', () => {
    expect(formatTimeAgo(agoMs(120_000))).toBe('2 minutes ago');
    expect(formatTimeAgo(agoMs(300_000))).toBe('5 minutes ago');
    expect(formatTimeAgo(agoMs(59 * 60_000))).toBe('59 minutes ago');
  });

  it('returns singular hour for 60–119 minutes', () => {
    expect(formatTimeAgo(agoMs(3_600_000))).toBe('1 hour ago');
    expect(formatTimeAgo(agoMs(7_000_000))).toBe('1 hour ago');
  });

  it('returns plural hours for 2–23 hours', () => {
    expect(formatTimeAgo(agoMs(7_200_000))).toBe('2 hours ago');
    expect(formatTimeAgo(agoMs(23 * 3_600_000))).toBe('23 hours ago');
  });

  it('returns singular day for 24–47 hours', () => {
    expect(formatTimeAgo(agoMs(86_400_000))).toBe('1 day ago');
  });

  it('returns plural days for 2+ days', () => {
    expect(formatTimeAgo(agoMs(172_800_000))).toBe('2 days ago');
    expect(formatTimeAgo(agoMs(7 * 86_400_000))).toBe('7 days ago');
  });
});
