import { useState, useEffect } from 'react';
import axios from 'axios';
import EventList from '../components/EventList';
import CreateEvent from '../components/CreateEvent';

const EventPage = ({ handleLogout }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
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

    fetchEvents();
  }, []);

  const handleEventAdded = (newEvent) => {
    setEvents((prevEvents) => [...prevEvents, newEvent]);
  };

  return (
    <div className="flex flex-col items-center bg-black/95 min-h-screen p-6">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-2xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Your Calendar Events</h2>
        
        <div className='flex justify-end mb-4'>
          <button 
            onClick={handleLogout} 
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-200"
          >
            Logout
          </button>
        </div>
        
        <CreateEvent onEventAdded={handleEventAdded} />
        
        <div className="mt-6">
          <EventList events={events} setEvents={setEvents} />
        </div>
      </div>
    </div>
  );
};

export default EventPage;
