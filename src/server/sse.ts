import express from 'express';

export const sseRoutes = express.Router();

// Store active connections (array of responses per user)
const clients = new Map<string, express.Response[]>();

sseRoutes.get('/stream', (req, res) => {
  const userId = req.query.userId as string;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  if (!clients.has(userId)) {
    clients.set(userId, []);
  }
  clients.get(userId)?.push(res);

  req.on('close', () => {
    const userClients = clients.get(userId);
    if (userClients) {
      const index = userClients.indexOf(res);
      if (index !== -1) {
        userClients.splice(index, 1);
      }
      if (userClients.length === 0) {
        clients.delete(userId);
      }
    }
  });
});

export function sendEventToUser(userId: string, data: any) {
  const userClients = clients.get(userId);
  if (userClients) {
    userClients.forEach(client => {
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  }
}
