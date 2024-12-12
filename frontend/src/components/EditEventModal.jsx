import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const EditEventModal = ({ event, isOpen, onClose, onEventUpdated }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDate(new Date(event.date).toISOString().slice(0, 16));
      setDescription(event.description);
    }
  }, [event]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      setMessage('User not authenticated');
      return;
    }
  
    try {
      await axios.put(`http://localhost:5000/events/${event.id}`, 
        { title, date, description }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      
      setMessage('Event updated successfully!');
      onEventUpdated();
      onClose();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error updating event');
      console.error('Error updating event:', error.response?.data);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 transform transition-all duration-300 ease-in-out scale-100 hover:shadow-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className='text-3xl font-extrabold text-gray-800'>Edit Event</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleUpdateEvent} className="space-y-6">
          <div>
            <label className='block text-lg font-semibold text-gray-700 mb-2'>Event Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}  
              placeholder="Enter event title"
              className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300' 
              required 
            />
          </div>

          <div>
            <label className='block text-lg font-semibold text-gray-700 mb-2'>Date & Time</label>
            <input 
              type="datetime-local" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300'
              required 
            />
          </div>

          <div>
            <label className='block text-lg font-semibold text-gray-700 mb-2'>Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Enter event description"
              className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 h-32'
            />
          </div>

          <div className='flex space-x-4 justify-end'>
            <button 
              type="button" 
              onClick={onClose} 
              className='px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-300'
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105'
            >
              Update Event
            </button>
          </div>

          {message && (
            <div className={`text-center py-2 rounded-lg ${message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

EditEventModal.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onEventUpdated: PropTypes.func.isRequired,
};

export default EditEventModal;