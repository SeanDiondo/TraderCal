import { db } from '../../src/db';
import { users } from '../../src/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return Response.json({ success: false, message: 'Email, password, and name are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return Response.json({ success: false, message: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.insert(users).values({
      email,
      password: hashedPassword,
      name,
    }).returning();

    return Response.json({ 
      success: true, 
      message: 'User registered successfully',
      user: { id: result[0].id, email: result[0].email, name: result[0].name }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return Response.json({ success: false, message: 'Error registering user', error: String(error) }, { status: 500 });
  }
}
