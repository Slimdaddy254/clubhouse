import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import passport from 'passport';
import pool from '../db.js';

const router = express.Router();

router.get('/signup', (req, res) => res.render('signup', { old: {} }));

router.post('/signup', [
  body('firstName').trim().notEmpty().withMessage('First name required'),
  body('lastName').trim().notEmpty().withMessage('Last name required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password min 8 chars'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.render('signup', { errors: errors.array(), old: req.body });

  const { firstName, lastName, email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash)
       VALUES ($1, $2, $3, $4)`,
      [firstName, lastName, email, hash]
    );
    return res.redirect('/login');
  } catch (err) {
    // handle unique email
    if (err.code === '23505') { // Postgres unique_violation
      return res.render('signup', { errors: [{ msg: 'Email already registered' }], old: req.body });
    }
    console.error(err);
    return res.render('signup', { errors: [{ msg: 'Internal error' }], old: req.body });
  }
});

router.get('/login', (req, res) => res.render('login'));

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

router.post('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

export default router;
