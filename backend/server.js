const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const passport = require('./utils/passport');
const session = require('express-session');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

dotenv.config();
const FRONTEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://experimentlabs-assignment-4.onrender.com'
  : 'http://localhost:5173';
const prisma = new PrismaClient();
const app = express();

const ALLOWED_ORIGINS = [
  'https://experimentlabs-assignment-4.onrender.com',  // Production frontend
  'http://localhost:5173'  // Development frontend
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (ALLOWED_ORIGINS.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

const SECRET_KEY = process.env.JWT_SECRET;

app.post('/auth/google/verify', async (req, res) => {
  try {
    const { credential } = req.body;
    
    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const email = payload.email;

    // Check if user exists, if not create one
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          password: '', // You might want to handle this differently
        },
      });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error verifying Google token:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Google Auth Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id }, SECRET_KEY, { expiresIn: '1h' });
    res.redirect(`${FRONTEND_URL}/events?token=${token}`);
});

// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];  // Extract token from "Bearer <token>"

  if (!token) return res.sendStatus(403);  // No token provided

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);  // Invalid token
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
    console.error('Error during login:', error);
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
        date: new Date(date),
        description,
        userId: req.user.userId,
      },
    });
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Error creating event' });
  }
});

// Get Events Route
app.get('/events', authenticateToken, async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { userId: req.user.userId },
    });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Error fetching events' });
  }
});

// Edit an existing event
app.put('/events/:id', authenticateToken, async (req, res) => {
  const { title, date, description } = req.body;

  try {
    const eventUpdateResponse = await prisma.event.updateMany({
      where: { id: parseInt(req.params.id), userId: req.user.userId },
      data: {
        title,
        date: new Date(date),
        description,
      },
    });

    if (eventUpdateResponse.count === 0) return res.status(403).json({ error: 'You can only update your own events.' });
    
    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Error updating event' });
  }
});

// Delete an event
app.delete('/events/:id', authenticateToken, async (req, res) => {
  try {
    const eventDeleteResponse = await prisma.event.deleteMany({
      where: { id: parseInt(req.params.id), userId: req.user.userId },
    });

    if (eventDeleteResponse.count === 0) return res.status(403).json({ error: 'You can only delete your own events.' });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Error deleting event' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});