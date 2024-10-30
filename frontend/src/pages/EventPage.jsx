import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EventList from '../components/EventList';
import CreateEvent from '../components/CreateEvent';

const EventPage = ({ handleLogout }) => {
  const [events, setEvents] = useState([]);

  // Fetch events when the component mounts
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

  // Function to update the events list when a new event is added
  const handleEventAdded = (newEvent) => {
    setEvents((prevEvents) => [...prevEvents, newEvent]); // Add new event to the state
  };

  return (
    <div className="flex flex-col items-center h-[2000px] bg-black/90">
      <div className="bg-white my-4 p-8 shadow-md rounded-md w-2/4">
        <h2 className="text-2xl font-bold mb-4 text-center">Your Calendar Events</h2>
        <div className='w-full flex justify-end'>
          <button 
            onClick={handleLogout} 
            className="mb-4 bg-red-500 text-white py-2 px-4 rounded"
          >
          Logout
        </button>
        </div>
        
        {/* Pass handleEventAdded to CreateEvent */}
        <CreateEvent onEventAdded={handleEventAdded} />
        {/* Pass the events state and setEvents to EventList */}
        <EventList events={events} setEvents={setEvents} />
      </div>
    </div>
  );
};

export default EventPage;
