import { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const CreateEvent = ({ onEventAdded }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      setMessage('User not authenticated');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/events', 
        { title, date, description }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

      setMessage('Event created successfully!');
      setTitle('');
      setDate('');
      setDescription('');

      onEventAdded(response.data);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error creating event');
      console.error('Error creating event:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Create New Event</h2>
        <p className="text-gray-600">Fill in the details below to create a new event</p>
      </div>

      <form onSubmit={handleCreateEvent} className="space-y-6">
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

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 bg-blue-600 text-white rounded-md font-medium 
            ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'} 
            transition-colors duration-200`}
        >
          {loading ? 'Creating Event...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
};

CreateEvent.propTypes = {
  onEventAdded: PropTypes.func.isRequired,
};

export default CreateEvent;
