import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../db.js';

const router = express.Router();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

function ensureAdmin(req, res, next) {
  if (req.user && req.user.is_admin) return next();
  res.redirect('/');
}

// GET route for displaying the new message form
router.get('/messages/new-message', (req, res) => {
  res.render('new-message');
});

// POST route for handling the submission of a new message
router.post('/messages/new-message', ensureAuthenticated, [
  body('title').trim().notEmpty(),
  body('body').trim().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.render('new-message', { errors: errors.array() });

  await pool.query(
    `INSERT INTO messages (title, body, user_id)
     VALUES ($1, $2, $3)`,
    [req.body.title, req.body.body, req.user.id]
  );
  res.redirect('/'); // Redirect to the home page after posting the message
});

router.post('/:id/delete', ensureAdmin, async (req, res) => {
  await pool.query('DELETE FROM messages WHERE id = $1', [req.params.id]);
  res.redirect('/');
});

export default router;
