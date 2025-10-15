import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { query } from '../db.js';

dotenv.config();

const SALT_ROUNDS = 12;

async function seed() {
  console.log('Seeding mock users and messages...');

  // Wipe tables (CAREFUL: This deletes all data)
  await query('DELETE FROM messages');
  await query('DELETE FROM users');

  // Create users
  const users = [
    { first: 'Alice', last: 'Wonderland', email: 'alice@example.com', pass: 'password123', isMember: true },
    { first: 'Bob', last: 'Builder', email: 'bob@example.com', pass: 'password123', isMember: false },
    { first: 'Charlie', last: 'Day', email: 'charlie@example.com', pass: 'password123', isMember: true },
  ];

  const userIds = [];
  for (const u of users) {
    const hash = await bcrypt.hash(u.pass, SALT_ROUNDS);
    const result = await query(
      `INSERT INTO users (first_name, last_name, email, password_hash, is_member, is_admin)
       VALUES ($1,$2,$3,$4,$5,false)
       RETURNING id`,
      [u.first, u.last, u.email, hash, u.isMember]
    );
    userIds.push(result.rows[0].id);
  }

  // Create messages
  const messages = [
    { title: 'Hello World', body: 'This is our first clubhouse message!', userIndex: 0 },
    { title: 'Important Announcement', body: 'Members-only event coming soon.', userIndex: 2 },
    { title: 'General Chat', body: 'What do you think about our new clubhouse?', userIndex: 1 },
    { title: 'Secret Note', body: 'Only members should see my name.', userIndex: 0 },
  ];

  for (const m of messages) {
    await query(
      `INSERT INTO messages (title, body, user_id)
       VALUES ($1,$2,$3)`,
      [m.title, m.body, userIds[m.userIndex]]
    );
  }

  console.log('✅ Mock data seeded!');
  process.exit();
}

seed().catch(err => {
  console.error('❌ Error seeding mock data:', err);
  process.exit(1);
});
