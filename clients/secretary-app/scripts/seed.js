/**
 * Seeds local PocketBase with test data.
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

const LODGES = [
  {
    name: 'Lodge of Harmony No. 255',
    province: 'Metropolitan',
    meeting_location: "Freemasons' Hall, London",
    members: [
      { first_name: 'James',    last_name: 'Whitfield',   rank: 'W Bro',  status: 'active' },
      { first_name: 'Richard',  last_name: 'Pemberton',   rank: 'Bro',    status: 'active' },
      { first_name: 'David',    last_name: 'Hargreaves',  rank: 'RW Bro', status: 'active' },
      { first_name: 'Thomas',   last_name: 'Elliot',      rank: 'Bro',    status: 'active' },
      { first_name: 'William',  last_name: 'Ashworth',    rank: 'VW Bro', status: 'honorary' },
      { first_name: 'George',   last_name: 'Sinclair',    rank: 'Bro',    status: 'active' },
      { first_name: 'Edward',   last_name: 'Montague',    rank: 'W Bro',  status: 'active' },
      { first_name: 'Henry',    last_name: 'Cartwright',  rank: 'Bro',    status: 'active' },
      { first_name: 'Charles',  last_name: 'Drummond',    rank: 'Bro',    status: 'active' },
      { first_name: 'Arthur',   last_name: 'Wainwright',  rank: 'Bro',    status: 'resigned' },
    ],
  },
  {
    name: 'Fortitude Lodge No. 481',
    province: 'West Yorkshire',
    meeting_location: 'Masonic Hall, Leeds',
    members: [
      { first_name: 'Robert',   last_name: 'Thornton',    rank: 'W Bro',  status: 'active' },
      { first_name: 'John',     last_name: 'Blackwood',   rank: 'Bro',    status: 'active' },
      { first_name: 'Michael',  last_name: 'Chadwick',    rank: 'Bro',    status: 'active' },
      { first_name: 'Peter',    last_name: 'Holroyd',     rank: 'RW Bro', status: 'active' },
      { first_name: 'Kenneth',  last_name: 'Sutcliffe',   rank: 'Bro',    status: 'active' },
      { first_name: 'Brian',    last_name: 'Ackroyd',     rank: 'W Bro',  status: 'active' },
      { first_name: 'Derek',    last_name: 'Marsden',     rank: 'Bro',    status: 'active' },
      { first_name: 'Alan',     last_name: 'Greenwood',   rank: 'Bro',    status: 'active' },
      { first_name: 'Roger',    last_name: 'Firth',       rank: 'VW Bro', status: 'honorary' },
      { first_name: 'Stanley',  last_name: 'Broadbent',   rank: 'Bro',    status: 'active' },
      { first_name: 'Gordon',   last_name: 'Whiteley',    rank: 'Bro',    status: 'active' },
      { first_name: 'Raymond',  last_name: 'Priestley',   rank: 'Bro',    status: 'resigned' },
    ],
  },
  {
    name: 'Prudence Lodge No. 1550',
    province: 'Hampshire and Isle of Wight',
    meeting_location: 'Masonic Temple, Southampton',
    members: [
      { first_name: 'Stephen',  last_name: 'Barrington',  rank: 'W Bro',  status: 'active' },
      { first_name: 'Andrew',   last_name: 'Lockwood',    rank: 'Bro',    status: 'active' },
      { first_name: 'Philip',   last_name: 'Cosgrove',    rank: 'Bro',    status: 'active' },
      { first_name: 'Martin',   last_name: 'Houghton',    rank: 'RW Bro', status: 'active' },
      { first_name: 'Geoffrey', last_name: 'Fairweather', rank: 'Bro',    status: 'active' },
      { first_name: 'Colin',    last_name: 'Redmayne',    rank: 'W Bro',  status: 'active' },
      { first_name: 'Keith',    last_name: 'Stansfield',  rank: 'Bro',    status: 'resigned' },
    ],
  },
  {
    name: 'Cornerstone Lodge No. 5987',
    province: 'East Lancashire',
    meeting_location: 'Masonic Hall, Manchester',
    members: [
      { first_name: 'Malcolm',  last_name: 'Entwistle',   rank: 'W Bro',  status: 'active' },
      { first_name: 'Trevor',   last_name: 'Ramsbottom',  rank: 'Bro',    status: 'active' },
      { first_name: 'Nigel',    last_name: 'Openshaw',    rank: 'Bro',    status: 'active' },
      { first_name: 'Clive',    last_name: 'Butterworth', rank: 'RW Bro', status: 'active' },
      { first_name: 'Leonard',  last_name: 'Heywood',     rank: 'VW Bro', status: 'honorary' },
      { first_name: 'Donald',   last_name: 'Ashton',      rank: 'Bro',    status: 'active' },
      { first_name: 'Bernard',  last_name: 'Crompton',    rank: 'W Bro',  status: 'active' },
      { first_name: 'Frank',    last_name: 'Ogden',       rank: 'Bro',    status: 'active' },
      { first_name: 'Norman',   last_name: 'Hindle',      rank: 'Bro',    status: 'active' },
      { first_name: 'Douglas',  last_name: 'Pickup',      rank: 'Bro',    status: 'active' },
      { first_name: 'Harold',   last_name: 'Scholes',     rank: 'Bro',    status: 'active' },
      { first_name: 'Gerald',   last_name: 'Nuttall',     rank: 'Bro',    status: 'resigned' },
      { first_name: 'Reginald', last_name: 'Harrop',      rank: 'Bro',    status: 'active' },
      { first_name: 'Cyril',    last_name: 'Pendlebury',  rank: 'Bro',    status: 'active' },
      { first_name: 'Albert',   last_name: 'Brierley',    rank: 'Bro',    status: 'active' },
    ],
  },
];

/** Assign dining statuses to non-resigned members with a realistic distribution */
function assignDiningStatuses(count) {
  const statuses = [];
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    if (r < 0.65) statuses.push('dining');
    else if (r < 0.85) statuses.push('not_dining');
    else statuses.push('undecided');
  }
  return statuses;
}

async function seed() {
  console.log(`Seeding PocketBase at ${PB_URL}...\n`);

  for (const lodgeData of LODGES) {
    const { members, ...lodgeFields } = lodgeData;

    // --- Lodge ---
    const lodge = await pb.collection('lodges').create(lodgeFields);
    console.log(`Lodge created: ${lodge.name} (${lodge.id})`);

    // --- Members ---
    const memberRecords = [];
    for (const m of members) {
      const record = await pb.collection('members').create({
        lodge_id: lodge.id,
        ...m,
      });
      memberRecords.push(record);
      console.log(`  Member: ${m.rank} ${m.first_name} ${m.last_name} (${m.status})`);
    }

    // --- Dining Records (active + honorary members only) ---
    const diningMembers = memberRecords.filter((m) => m.status !== 'resigned');
    const statuses = assignDiningStatuses(diningMembers.length);

    for (let i = 0; i < diningMembers.length; i++) {
      const member = diningMembers[i];
      await pb.collection('dining_records').create({
        lodge_id: lodge.id,
        member_id: member.id,
        meeting_date: MEETING_DATE,
        status: statuses[i],
        updated_by: 'seed',
      });
      console.log(`  Dining: ${member.first_name} ${member.last_name} -> ${statuses[i]}`);
    }

    console.log('');
  }

  console.log('Done. Remember to restore create rules when finished.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
