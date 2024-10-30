import React from 'react';
import axios from 'axios';

const EventList = ({ events, setEvents }) => {
  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/events/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEvents(events.filter(event => event.id !== id)); // Update state after deletion
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <div className='my-2'>
      <h2 className='font-bold text-2xl my-2'>Your Events</h2>
      <ul>
        {events.map((event) => (
          <li key={event.id} className='flex justify-between my-4'>
            <h3 className='font-semibold text-lg'>{event.title}</h3>
            <p className='font-semibold text-lg'>{new Date(event.date).toLocaleString()}</p>
            <p className='font-semibold text-lg'>{event.description}</p>
            <button onClick={() => handleDelete(event.id)} className='bg-red-500 px-4 py-2 rounded-md text-white'>Delete</button>
            {/* You can implement an Edit button that opens a modal/form for editing the event */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventList;
