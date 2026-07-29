import { db } from '../../src/db/index.js';
import { users } from '../../src/db/schema.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    // Find user
    const user = await db.select().from(users).where(eq(users.email, email));
    if (user.length === 0) {
      return Response.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user[0].password);
    if (!isValidPassword) {
      return Response.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not configured');
      return Response.json({ success: false, message: 'Server configuration error' }, { status: 500 });
    }

    const token = jwt.sign(
      { userId: user[0].id, email: user[0].email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return Response.json({ 
      success: true, 
      token,
      user: { id: user[0].id, email: user[0].email, name: user[0].name }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return Response.json({ success: false, message: 'Error logging in', error: String(error) }, { status: 500 });
  }
}
