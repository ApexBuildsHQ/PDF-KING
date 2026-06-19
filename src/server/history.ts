import { Router } from 'express';
import { fetchUserHistory, saveToHistory } from './db.js';
import db from './db.js';

export const historyRoutes = Router();

// Fetch user history
historyRoutes.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check user plan to determine limit
    const userStmt = db.prepare('SELECT subscription_plan_id, is_premium FROM users WHERE id = ?');
    const user = userStmt.get(userId) as any;
    
    let limit = undefined;
    // If not premium or plan is not King, limit to 5
    if (!user || !user.is_premium || user.subscription_plan_id !== 'king') {
      limit = 5;
    }

    const history = fetchUserHistory(userId, limit);
    res.json({ history, isPremium: user?.is_premium, planId: user?.subscription_plan_id });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Save to history
historyRoutes.post('/', (req, res) => {
  try {
    const { userId, fileName, toolUsed, cloudLink } = req.body;
    if (!userId || !fileName || !toolUsed || !cloudLink) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    saveToHistory(userId, fileName, toolUsed, cloudLink);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error saving history:', error);
    res.status(500).json({ error: 'Failed to save history' });
  }
});
