const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

const SECRET_KEY = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];  // Extract token from "Bearer <token>"

  if (!token) return res.sendStatus(403);  // No token provided

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);  // Invalid token
    console.log('User decoded from token:', user);  // Log the user for debugging
    req.user = user;  // Store user info for future use
    next();
  });
};

// User Registration Route
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: 'User already exists' });
  }
});

// User Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error);  // Log the error
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Create Event Route
app.post('/events', authenticateToken, async (req, res) => {
  const { title, date, description } = req.body;

  try {
    const event = await prisma.event.create({
      data: {
        title,
        date: new Date(date),  // Ensure the date format is correct
        description,
        userId: req.user.userId,  // Use req.user.userId from the decoded token
      },
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Error creating event' });
  }
});

app.get('/events', authenticateToken, async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { userId: req.user.userId },  // Filter events by logged-in user
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching events' });
  }
});


// Edit an existing event
app.put('/events/:id', authenticateToken, async (req, res) => {
  const { title, date, description } = req.body; // Updated here
  
  try {
    const event = await prisma.event.updateMany({
      where: { id: parseInt(req.params.id), userId: req.user.id },
      data: {
        title,
        date: new Date(date), // Ensure proper date format
        description,
      },
    });
    
    if (event.count === 0) return res.status(403).json({ error: 'You can only update your own events.' });
    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating event' });
  }
});


app.delete('/events/:id', authenticateToken, async (req, res) => {
  try {
    const event = await prisma.event.deleteMany({
      where: { id: parseInt(req.params.id), userId: req.user.id }, // Ensure user can only delete their events
    });

    if (event.count === 0) return res.status(403).json({ error: 'You can only delete your own events.' });
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting event' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
