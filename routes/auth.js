import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import passport from 'passport';
import pool from '../db.js';

const router = express.Router();

router.get('/signup', (req, res) => res.render('signup'));

router.post('/signup', [
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.render('signup', { errors: errors.array() });

  const { firstName, lastName, email, password } = req.body;
  const hash = await bcrypt.hash(password, 12);

  await pool.query(
    `INSERT INTO users (first_name, last_name, email, password_hash)
     VALUES ($1, $2, $3, $4)`,
    [firstName, lastName, email, hash]
  );

  res.redirect('/login');
});

router.get('/login', (req, res) => res.render('login'));

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

export default router;
