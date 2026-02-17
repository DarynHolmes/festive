import { pb } from './pocketbase';
import { toLodge } from './mappers';
import type { LodgeRecord, Lodge } from './types';

export async function fetchAllLodges(): Promise<Lodge[]> {
  const records = await pb.collection('lodges').getFullList<LodgeRecord>();
  return records.map(toLodge);
}
