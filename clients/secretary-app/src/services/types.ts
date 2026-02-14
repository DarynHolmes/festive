import type { RecordModel } from 'pocketbase';

// ---------------------------------------------------------------------------
// PocketBase record shapes (what the API returns)
// ---------------------------------------------------------------------------

export interface LodgeRecord extends RecordModel {
  name: string;
  province: string;
  meeting_location: string;
}

export interface MemberRecord extends RecordModel {
  lodge_id: string;
  first_name: string;
  last_name: string;
  rank: 'Bro' | 'W Bro' | 'VW Bro' | 'RW Bro';
  status: 'active' | 'honorary' | 'resigned';
}

export interface DiningRecord extends RecordModel {
  lodge_id: string;
  member_id: string;
  meeting_date: string;
  status: DiningStatus;
  updated_by: string;
}

// ---------------------------------------------------------------------------
// Domain types (what the app consumes)
// ---------------------------------------------------------------------------

export type DiningStatus = 'dining' | 'not_dining' | 'undecided';

export interface Lodge {
  id: string;
  name: string;
  province: string;
  meetingLocation: string;
}

export interface Member {
  id: string;
  lodgeId: string;
  firstName: string;
  lastName: string;
  rank: string;
  status: string;
}

export interface DiningEntry {
  id: string;
  lodgeId: string;
  memberId: string;
  meetingDate: string;
  status: DiningStatus;
  updatedBy: string;
}

export interface DiningTableRow {
  memberId: string;
  diningRecordId: string | null;
  rank: string;
  firstName: string;
  lastName: string;
  status: DiningStatus;
}
