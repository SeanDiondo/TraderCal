import { db } from '../src/db';
import { journal } from '../src/db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const entries = await db.select().from(journal).orderBy(journal.createdAt);
      res.status(200).json({ success: true, data: entries });
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      res.status(500).json({ success: false, message: 'Error fetching journal entries' });
    }
  } else if (req.method === 'POST') {
    try {
      const { date, pair, pnlUsd, usdToPhp } = req.body;

      const result = await db.insert(journal).values({
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
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
