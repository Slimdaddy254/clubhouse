import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../db.js';

const router = express.Router();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

router.get('/join', ensureAuthenticated, (req, res) => res.render('join'));

router.post('/join', ensureAuthenticated, [
  body('passcode').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.render('join', { errors: errors.array() });

  if (req.body.passcode === process.env.CLUB_PASSCODE) {
    await pool.query('UPDATE users SET is_member = true WHERE id = $1', [req.user.id]);
    res.redirect('/');
  } else {
    res.render('join', { errors: [{ msg: 'Wrong passcode' }] });
  }
});

export default router;
