import { useState } from 'react';
import axios from 'axios';
import EditEventModal from './EditEventModal';
import PropTypes from 'prop-types';

const EventList = ({ events, setEvents }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/events/${id}`, {
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
      const response = await axios.get(`${API_URL}/events`, {
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
    <div className='my-4'>
      <h2 className='font-bold text-xl mb-4'>Your Events</h2>
      
      {events.length === 0 ? (
        <p className='text-gray-500'>No events available. Please add some!</p>
       ) : (
         <ul>
           {events.map((event) => (
             <li key={event.id} className='flex justify-between items-center my-2 p-4 bg-white shadow-md rounded-md'>
               <div className='flex-grow'>
                 <h3 className='font-semibold text-lg'>{event.title}</h3>
                 <p className='text-sm text-gray-600'>{new Date(event.date).toLocaleString()}</p>
                 <p className='text-gray-700'>{event.description}</p>
               </div>
               <div className='flex space-x-2'>
                 <button 
                   onClick={() => handleEdit(event)} 
                   className='bg-blue-500 px-3 py-1 rounded-md text-white hover:bg-blue-600 transition'
                 >
                   Edit
                 </button>
                 <button 
                   onClick={() => handleDelete(event.id)} 
                   className='bg-red-500 px-3 py-1 rounded-md text-white hover:bg-red-600 transition'
                 >
                   Delete
                 </button>
               </div>
             </li>
           ))}
         </ul>
       )}

       {/* Edit Event Modal */}
       {selectedEvent && (
         <EditEventModal 
           event={selectedEvent} 
           isOpen={isEditModalOpen} 
           onClose={() => setIsEditModalOpen(false)}
           onEventUpdated={fetchUpdatedEvents}
         />
       )}
     </div>
   );
};

EventList.propTypes = {
   events: PropTypes.array.isRequired,
   setEvents: PropTypes.func.isRequired,
};

export default EventList;
