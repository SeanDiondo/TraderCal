import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { db } from './src/db';
import { contacts } from './src/db/schema';

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
