import { db } from '../../src/db';
import { journal } from '../../src/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

function verifyToken(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
  } catch {
    return null;
  }
}

export async function PUT(req:	Request, { params }: { params: { id: string } }) {
  const user = verifyToken(req);
  
  if (!user) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const body = await req.json();
    const { date, pair, pnlUsd, usdToPhp } = body;

    const result = await db.update(journal)
      .set({
        date,
        pair: pair.toUpperCase(),
        pnlUsd: pnlUsd.toString(),
        usdToPhp: usdToPhp.toString(),
      })
      .where(eq(journal.id, parseInt(id)))
      .returning();
    
    return Response.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    return Response.json({ success: false, message: 'Error updating journal entry' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = verifyToken(req);
  
  if (!user) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    await db.delete(journal).where(eq(journal.id, parseInt(id)));
    return Response.json({ success: true, message: 'Journal entry deleted' });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return Response.json({ success: false, message: 'Error deleting journal entry' }, { status: 500 });
  }
}
