import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { db } from './src/db';
import { contacts, journal } from './src/db/schema';
import { eq } from 'drizzle-orm';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

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
