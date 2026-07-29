import { db } from '../src/db';
import { journal } from '../src/db/schema';
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

export async function GET(req: Request) {
  const user = verifyToken(req);
  
  if (!user) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const entries = await db.select().from(journal).where(eq(journal.userId, user.userId)).orderBy(journal.createdAt);
    return Response.json({ success: true, data: entries });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return Response.json({ success: false, message: 'Error fetching journal entries' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = verifyToken(req);
  
  if (!user) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { date, pair, pnlUsd, usdToPhp } = body;

    const result = await db.insert(journal).values({
      userId: user.userId,
      date,
      pair: pair.toUpperCase(),
      pnlUsd: pnlUsd.toString(),
      usdToPhp: usdToPhp.toString(),
    }).returning();
    
    return Response.json({ success: true, data: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return Response.json({ success: false, message: 'Error creating journal entry' }, { status: 500 });
  }
}
