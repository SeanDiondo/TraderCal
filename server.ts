import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { db } from './src/db';
import { contacts, journal, users } from './src/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Auth API endpoints
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.insert(users).values({
      email,
      password: hashedPassword,
      name,
    }).returning();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { id: result[0].id, email: result[0].email, name: result[0].name }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, message: 'Error registering user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.select().from(users).where(eq(users.email, email));
    if (user.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user[0].password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user[0].id, email: user[0].email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: { id: user[0].id, email: user[0].email, name: user[0].name }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, message: 'Error logging in' });
  }
});

// API endpoint to handle contact form submission
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const result = await db.insert(contacts).values({
      name,
      email,
      message,
    }).returning();
    
    res.status(201).json({ 
      success: true, 
      data: result[0] 
    });
  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving contact information' 
    });
  }
});

// Journal API endpoints
app.get('/api/journal', async (req, res) => {
  try {
    const entries = await db.select().from(journal).orderBy(journal.createdAt);
    res.json({ success: true, data: entries });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ success: false, message: 'Error fetching journal entries' });
  }
});

app.post('/api/journal', async (req, res) => {
  const { date, pair, pnlUsd, usdToPhp } = req.body;

  try {
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
});

app.put('/api/journal/:id', async (req, res) => {
  const { id } = req.params;
  const { date, pair, pnlUsd, usdToPhp } = req.body;

  try {
    const result = await db.update(journal)
      .set({
        date,
        pair: pair.toUpperCase(),
        pnlUsd: pnlUsd.toString(),
        usdToPhp: usdToPhp.toString(),
      })
      .where(eq(journal.id, parseInt(id)))
      .returning();
    
    res.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    res.status(500).json({ success: false, message: 'Error updating journal entry' });
  }
});

app.delete('/api/journal/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.delete(journal).where(eq(journal.id, parseInt(id)));
    res.json({ success: true, message: 'Journal entry deleted' });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({ success: false, message: 'Error deleting journal entry' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
