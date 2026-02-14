import type { LodgeRecord, DiningRecord, Lodge, DiningEntry } from './types';

export function toLodge(record: LodgeRecord): Lodge {
  return {
    id: record.id,
    name: record.name,
    province: record.province,
    meetingLocation: record.meeting_location,
  };
}

export function toDiningEntry(record: DiningRecord): DiningEntry {
  return {
    id: record.id,
    lodgeId: record.lodge_id,
    memberId: record.member_id,
    meetingDate: record.meeting_date,
    status: record.status,
    updatedBy: record.updated_by,
  };
}
