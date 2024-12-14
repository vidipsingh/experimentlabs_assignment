const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const passport = require('./utils/passport');
const session = require('express-session');
const { OAuth2Client } = require('google-auth-library');

dotenv.config();

const FRONTEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://experimentlabs-assignment-4.onrender.com'
  : 'http://localhost:5173';

const BACKEND_URL = process.env.NODE_ENV === 'production'
  ? 'https://experimentlabs-assignment-3.onrender.com'
  : 'http://localhost:5000';

const prisma = new PrismaClient();
const app = express();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Updated CORS configuration
const corsOptions = {
  origin: [
    'https://experimentlabs-assignment-4.onrender.com',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Session configuration with updated settings
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

const SECRET_KEY = process.env.JWT_SECRET;

// Updated Google verification endpoint
app.post('/auth/google/verify', async (req, res) => {
  try {
    const { credential } = req.body;
    
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: await bcrypt.hash(Math.random().toString(36), 10),
        },
      });
    }

    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        name: user.name
      }, 
      SECRET_KEY, 
      { expiresIn: '24h' }
    );

    res.json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Error verifying Google token:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Updated Google OAuth routes
app.get('/auth/google',
  passport.authenticate('google', { 
    scope: ['email', 'profile'],
    prompt: 'select_account'
  })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login` }),
  (req, res) => {
    const token = jwt.sign(
      { 
        userId: req.user.id,
        email: req.user.email,
        name: req.user.name
      }, 
      SECRET_KEY, 
      { expiresIn: '24h' }
    );
    res.redirect(`${FRONTEND_URL}/events?token=${token}`);
  }
);

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