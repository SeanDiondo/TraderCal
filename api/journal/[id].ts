import { db } from '../../src/db/index.js';
import { journal } from '../../src/db/schema.js';
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

export async function PUT(req: any, res: any) {
  const user = verifyToken(req);
  
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { id } = req.query;

  try {
    const { date, pair, pnlUsd, usdToPhp } = req.body;

    const result = await db.update(journal)
      .set({
        date,
        pair: pair.toUpperCase(),
        pnlUsd: pnlUsd.toString(),
        usdToPhp: usdToPhp.toString(),
      })
      .where(eq(journal.id, parseInt(id)))
      .returning();
    
    res.status(200).json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    res.status(500).json({ success: false, message: 'Error updating journal entry' });
  }
}

export async function DELETE(req: any, res: any) {
  const user = verifyToken(req);
  
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { id } = req.query;

  try {
    await db.delete(journal).where(eq(journal.id, parseInt(id)));
    res.status(200).json({ success: true, message: 'Journal entry deleted' });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({ success: false, message: 'Error deleting journal entry' });
  }
}
