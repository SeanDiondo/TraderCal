import { db } from '../../src/db/index.js';
import { users } from '../../src/db/schema.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find user
    const user = await db.select().from(users).where(eq(users.email, email));
    if (user.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user[0].password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const token = jwt.sign(
      { userId: user[0].id, email: user[0].email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(200).json({ 
      success: true, 
      token,
      user: { id: user[0].id, email: user[0].email, name: user[0].name }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, message: 'Error logging in', error: String(error) });
  }
}
