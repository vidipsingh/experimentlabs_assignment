import { useState } from 'react';
import axios from 'axios';
import EditEventModal from './EditEventModal';
import PropTypes from 'prop-types';

const EventList = ({ events, setEvents }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/events/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEvents(events.filter(event => event.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  const fetchUpdatedEvents = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:5000/events', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  return (
    <div className='my-2'>
      <h2 className='font-bold text-2xl my-2'>Your Events</h2>
      <ul>
        {events.map((event) => (
          <li key={event.id} className='flex justify-between items-center my-4 p-4 bg-stone-100 rounded-md'>
            <div className='flex-grow'>
              <h3 className='font-semibold text-lg'>{event.title}</h3>
              <p className='text-sm text-gray-600'>{new Date(event.date).toLocaleString()}</p>
              <p className='text-gray-700'>{event.description}</p>
            </div>
            <div className='flex space-x-2'>
              <button 
                onClick={() => handleEdit(event)} 
                className='bg-blue-500 px-4 py-2 rounded-md text-white'
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(event.id)} 
                className='bg-red-500 px-4 py-2 rounded-md text-white'
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <EditEventModal 
        event={selectedEvent} 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        onEventUpdated={fetchUpdatedEvents}
      />
    </div>
  );
};

EventList.propTypes = {
  events: PropTypes.array.isRequired,
  setEvents: PropTypes.func.isRequired,
};

export default EventList;