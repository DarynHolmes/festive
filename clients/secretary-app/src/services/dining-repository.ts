import { pb } from './pocketbase';
import { toMember, toDiningEntry, mergeMembersWithDining } from './mappers';
import type {
  MemberRecord,
  DiningRecord,
  DiningTableRow,
  DiningEntry,
  DiningStatus,
} from './types';

export async function fetchDiningDashboard(
  lodgeId: string,
): Promise<DiningTableRow[]> {
  const [memberRecords, diningRecords] = await Promise.all([
    pb.collection('members').getFullList<MemberRecord>({
      filter: `lodge_id = "${lodgeId}"`,
      sort: 'last_name',
    }),
    pb.collection('dining_records').getFullList<DiningRecord>({
      filter: `lodge_id = "${lodgeId}"`,
    }),
  ]);

  const members = memberRecords.map(toMember);
  const dining = diningRecords.map(toDiningEntry);

  return mergeMembersWithDining(members, dining);
}

export async function updateDiningStatus(
  recordId: string,
  status: DiningStatus,
): Promise<DiningEntry> {
  const record = await pb
    .collection('dining_records')
    .update<DiningRecord>(recordId, { status });
  return toDiningEntry(record);
}

export async function createDiningRecord(data: {
  lodgeId: string;
  memberId: string;
  status: DiningStatus;
}): Promise<DiningEntry> {
  const record = await pb
    .collection('dining_records')
    .create<DiningRecord>({
      lodge_id: data.lodgeId,
      member_id: data.memberId,
      meeting_date: new Date().toISOString(),
      status: data.status,
      updated_by: 'secretary',
    });
  return toDiningEntry(record);
}
