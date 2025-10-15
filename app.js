import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import flash from 'connect-flash';
import path from "path";
import pool from "./db.js";
import expressLayouts from 'express-ejs-layouts';


import { fileURLToPath } from "url";

import authRoutes from './routes/auth.js';
import membershipRoutes from './routes/membership.js';
import messageRoutes from './routes/messages.js';

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load .env from project root (one level above /src)
dotenv.config({ path: path.resolve(__dirname, "../env") });

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout");
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return done(null, false, { message: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return done(null, false, { message: 'Invalid email or password' });

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
});

app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.messages = req.flash();
  next();
});

app.use('/', authRoutes);
app.use('/', membershipRoutes);
app.use('/', messageRoutes);       

app.get('/', async (req, res) => {
  const result = await pool.query(
    `SELECT m.*, u.first_name, u.last_name FROM messages m
     JOIN users u ON m.user_id = u.id
     ORDER BY m.created_at DESC`
  );
  res.render('index', { messagesList: result.rows });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
