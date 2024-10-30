import { useState } from 'react';
import axios from 'axios';

const EventForm = ({ fetchEvents }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/events', {
        title,
        date,
        description,
        userId: 1, // Adjust based on auth
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <form onSubmit={handleCreateEvent}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Event Title"
        required
      />
      <input
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />
      <button type="submit">Create Event</button>
    </form>
  );
};

export default EventForm;
