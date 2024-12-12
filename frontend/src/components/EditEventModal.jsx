import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const EditEventModal = ({ event, isOpen, onClose, onEventUpdated }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    setLoading(true);
    setError('');
    setMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to update the event');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, date, description })
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      const data = await response.json();
      setMessage('Event updated successfully!');
      onEventUpdated(data);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setError(error.message || 'Error updating event');
      console.error('Error updating event:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto"
      onClick={handleOverlayClick}
    >
      <div 
        className="max-w-xl w-full bg-white rounded-lg shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Edit Event</h2>
              <p className="text-gray-600">Update the event details below</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleUpdateEvent} className="space-y-6">
          <div>
            <label 
              htmlFor="title" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Event Title
            </label>
            <input
              id="title"
              type="text"
              placeholder="Enter event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <div>
            <label 
              htmlFor="date" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date & Time
            </label>
            <input
              id="date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <div>
            <label 
              htmlFor="description" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              placeholder="Enter event description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {message && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-600">{message}</p>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 px-4 bg-blue-600 text-white rounded-md font-medium 
                ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'} 
                transition-colors duration-200`}
            >
              {loading ? 'Updating Event...' : 'Update Event'}
            </button>
          </div>
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