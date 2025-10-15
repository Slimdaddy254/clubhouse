import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { query } from '../db.js';

dotenv.config();

const hash = await bcrypt.hash(process.env.ADMIN_PASS, 12);
const result = await query('SELECT * FROM users WHERE email = $1', [process.env.ADMIN_EMAIL]);

if (result.rows.length === 0) {
  await query(
    `INSERT INTO users (first_name, last_name, email, password_hash, is_member, is_admin)
     VALUES ('Admin','User',$1,$2,true,true)`,
    [process.env.ADMIN_EMAIL, hash]
  );
  console.log('Admin user created');
} else {
  console.log('Admin already exists');
}
process.exit();
