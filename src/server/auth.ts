import express from 'express';
import db from './db';
import crypto from 'crypto';

export const authRoutes = express.Router();

// Simple hash function for demonstration (use bcrypt in production)
const hashPassword = (password: string) => crypto.createHash('sha256').update(password).digest('hex');

authRoutes.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const id = crypto.randomUUID();
  const hashedPassword = hashPassword(password);

  try {
    const stmt = db.prepare('INSERT INTO users (id, name, email, password, has_seen_welcome) VALUES (?, ?, ?, ?, 0)');
    stmt.run(id, name, email, hashedPassword);
    res.json({ user: { id, name, email, isPremium: false, planId: null, hasSeenWelcome: false }, token: id }); // Using ID as token for simplicity
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

authRoutes.post('/login', (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = hashPassword(password);

  try {
    const stmt = db.prepare('SELECT id, name, email, is_premium, subscription_plan_id, has_seen_welcome FROM users WHERE email = ? AND password = ?');
    const user = stmt.get(email, hashedPassword) as any;

    if (user) {
      res.json({ 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          isPremium: !!user.is_premium, 
          planId: user.subscription_plan_id,
          hasSeenWelcome: !!user.has_seen_welcome
        }, 
        token: user.id 
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

authRoutes.get('/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const stmt = db.prepare('SELECT id, name, email, is_premium, subscription_plan_id, has_seen_welcome FROM users WHERE id = ?');
    const user = stmt.get(token) as any;

    if (user) {
      res.json({ 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          isPremium: !!user.is_premium, 
          planId: user.subscription_plan_id,
          hasSeenWelcome: !!user.has_seen_welcome
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

authRoutes.post('/welcome-seen', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const stmt = db.prepare('UPDATE users SET has_seen_welcome = 1 WHERE id = ?');
    stmt.run(token);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});
