const db = require('../db');

exports.createEvent = (req, res) => {
  const { title, date, description } = req.body;
  const userId = req.userId;

  db.query('INSERT INTO events (title, date, description, userId) VALUES (?, ?, ?, ?)', [title, date, description, userId], (err, result) => {
    if (err) return res.status(500).send('Error creating event.');
    res.send('Event created successfully.');
  });
};

exports.getEvents = (req, res) => {
  const userId = req.userId;

  db.query('SELECT * FROM events WHERE userId = ?', [userId], (err, results) => {
    if (err) return res.status(500).send('Error fetching events.');
    res.send(results);
  });
};

exports.updateEvent = (req, res) => {
  const { title, date, description } = req.body;
  const eventId = req.params.id;
  const userId = req.userId;

  db.query('UPDATE events SET title = ?, date = ?, description = ? WHERE id = ? AND userId = ?', [title, date, description, eventId, userId], (err, result) => {
    if (err) return res.status(500).send('Error updating event.');
    res.send('Event updated successfully.');
  });
};

exports.deleteEvent = (req, res) => {
  const eventId = req.params.id;
  const userId = req.userId;

  db.query('DELETE FROM events WHERE id = ? AND userId = ?', [eventId, userId], (err, result) => {
    if (err) return res.status(500).send('Error deleting event.');
    res.send('Event deleted successfully.');
  });
};
