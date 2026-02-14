import type { RecordModel } from 'pocketbase';

// ---------------------------------------------------------------------------
// PocketBase record shapes (what the API returns)
// ---------------------------------------------------------------------------

export interface LodgeRecord extends RecordModel {
  name: string;
  province: string;
  meeting_location: string;
}

export interface DiningRecord extends RecordModel {
  lodge_id: string;
  member_id: string;
  meeting_date: string;
  status: 'dining' | 'not_dining' | 'undecided';
  updated_by: string;
}

// ---------------------------------------------------------------------------
// Domain types (what the app consumes)
// ---------------------------------------------------------------------------

export interface Lodge {
  id: string;
  name: string;
  province: string;
  meetingLocation: string;
}

export interface DiningEntry {
  id: string;
  lodgeId: string;
  memberId: string;
  meetingDate: string;
  status: 'dining' | 'not_dining' | 'undecided';
  updatedBy: string;
}
