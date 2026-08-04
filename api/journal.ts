import { db } from '../src/db/index.js';
import { journal } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

function verifyToken(req: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
  } catch {
    return null;
  }
}

export async function GET(req: any, res: any) {
  const user = verifyToken(req);
  
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const entries = await db.select().from(journal).where(eq(journal.userId, user.userId)).orderBy(journal.createdAt);
    res.status(200).json({ success: true, data: entries });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ success: false, message: 'Error fetching journal entries' });
  }
}

export async function POST(req: any, res: any) {
  const user = verifyToken(req);
  
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { date, pair, pnlUsd, usdToPhp } = req.body;

    const result = await db.insert(journal).values({
      userId: user.userId,
      date,
      pair: pair.toUpperCase(),
      pnlUsd: pnlUsd.toString(),
      usdToPhp: usdToPhp.toString(),
    }).returning();
    
    res.status(201).json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({ success: false, message: 'Error creating journal entry' });
  }
}
