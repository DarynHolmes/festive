/**
 * Seeds local PocketBase with test data for Sprint 1 development.
 *
 * Prerequisites:
 *   - PocketBase running at VITE_POCKETBASE_URL (default: http://127.0.0.1:8090)
 *   - Create rules temporarily opened on lodges, members, and dining_records
 *
 * Usage:
 *   node scripts/seed.js
 */

import PocketBase from 'pocketbase';

const PB_URL = process.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
const pb = new PocketBase(PB_URL);

const MEETING_DATE = '2026-03-14 18:30:00.000Z';

const MEMBERS = [
  { first_name: 'James',   last_name: 'Whitfield',  rank: 'W Bro',  status: 'active' },
  { first_name: 'Richard', last_name: 'Pemberton',  rank: 'Bro',    status: 'active' },
  { first_name: 'David',   last_name: 'Hargreaves', rank: 'RW Bro', status: 'active' },
  { first_name: 'Thomas',  last_name: 'Elliot',     rank: 'Bro',    status: 'active' },
  { first_name: 'William', last_name: 'Ashworth',   rank: 'VW Bro', status: 'honorary' },
  { first_name: 'George',  last_name: 'Sinclair',   rank: 'Bro',    status: 'active' },
  { first_name: 'Edward',  last_name: 'Montague',   rank: 'W Bro',  status: 'active' },
  { first_name: 'Henry',   last_name: 'Cartwright', rank: 'Bro',    status: 'active' },
  { first_name: 'Charles', last_name: 'Drummond',   rank: 'Bro',    status: 'active' },
  { first_name: 'Arthur',  last_name: 'Wainwright', rank: 'Bro',    status: 'resigned' },
];

const DINING_STATUSES = [
  'dining', 'dining', 'dining', 'undecided',
  'dining', 'not_dining', 'dining', 'undecided', 'dining',
];

async function seed() {
  console.log(`Seeding PocketBase at ${PB_URL}...\n`);

  // --- Lodge ---
  const lodge = await pb.collection('lodges').create({
    name: 'Lodge of Harmony No. 255',
    province: 'Metropolitan',
    meeting_location: "Freemasons' Hall, London",
  });
  console.log(`Lodge created: ${lodge.name} (${lodge.id})`);

  // --- Members ---
  const memberRecords = [];
  for (const m of MEMBERS) {
    const record = await pb.collection('members').create({
      lodge_id: lodge.id,
      ...m,
    });
    memberRecords.push(record);
    console.log(`  Member: ${m.rank} ${m.first_name} ${m.last_name} (${m.status})`);
  }

  // --- Dining Records (active + honorary members only) ---
  const diningMembers = memberRecords.filter((m) => m.status !== 'resigned');
  for (let i = 0; i < diningMembers.length; i++) {
    const member = diningMembers[i];
    const status = DINING_STATUSES[i];
    await pb.collection('dining_records').create({
      lodge_id: lodge.id,
      member_id: member.id,
      meeting_date: MEETING_DATE,
      status,
      updated_by: 'seed',
    });
    console.log(`  Dining: ${member.first_name} ${member.last_name} → ${status}`);
  }

  console.log('\nDone. Remember to restore create rules when finished.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
