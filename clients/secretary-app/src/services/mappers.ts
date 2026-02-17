import type {
  LodgeRecord,
  DiningRecord,
  MemberRecord,
  Lodge,
  DiningEntry,
  Member,
  DiningTableRow,
} from './types';

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

export function toMember(record: MemberRecord): Member {
  return {
    id: record.id,
    lodgeId: record.lodge_id,
    firstName: record.first_name,
    lastName: record.last_name,
    rank: record.rank,
    status: record.status,
  };
}

export function mergeMembersWithDining(
  members: Member[],
  diningEntries: DiningEntry[],
): DiningTableRow[] {
  const diningByMember = new Map(
    diningEntries.map((d) => [d.memberId, d]),
  );

  return members
    .filter((m) => m.status !== 'resigned')
    .map((m) => {
      const dining = diningByMember.get(m.id);
      return {
        memberId: m.id,
        diningRecordId: dining?.id ?? null,
        rank: m.rank,
        firstName: m.firstName,
        lastName: m.lastName,
        status: dining?.status ?? 'undecided',
      };
    });
}
