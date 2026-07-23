import { db } from '../../src/db';
import { journal } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: any, res: any) {
  const { id } = req.query;

  if (req.method === 'PUT') {
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
  } else if (req.method === 'DELETE') {
    try {
      await db.delete(journal).where(eq(journal.id, parseInt(id)));
      res.status(200).json({ success: true, message: 'Journal entry deleted' });
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      res.status(500).json({ success: false, message: 'Error deleting journal entry' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
