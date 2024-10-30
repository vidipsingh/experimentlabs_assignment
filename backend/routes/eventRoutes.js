const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create an event
router.post('/events', async (req, res) => {
  const { title, date, description, userId } = req.body;

  try {
    const event = await prisma.event.create({
      data: {
        title,
        date: new Date(date),
        description,
        user: { connect: { id: userId } },
      },
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: 'Error creating event' });
  }
});

// Get all events for a user
router.get('/events', async (req, res) => {
  const { userId } = req.query;

  try {
    const events = await prisma.event.findMany({
      where: { userId: parseInt(userId) },
    });
    res.status(200).json(events);
  } catch (error) {
    res.status(400).json({ error: 'Error fetching events' });
  }
});

// Update an event
router.put('/events/:id', async (req, res) => {
  const { id } = req.params;
  const { title, date, description } = req.body;

  try {
    const event = await prisma.event.update({
      where: { id: parseInt(id) },
      data: { title, date: new Date(date), description },
    });
    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ error: 'Error updating event' });
  }
});

// Delete an event
router.delete('/events/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.event.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: 'Event deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Error deleting event' });
  }
});

module.exports = router;
