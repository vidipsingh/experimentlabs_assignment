import { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const EventForm = ({ fetchEvents }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API_URL}/events`, {
        title,
        date,
        description,
        userId: 1,
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

EventForm.propTypes = {
  fetchEvents: PropTypes.func.isRequired,
};

export default EventForm;
