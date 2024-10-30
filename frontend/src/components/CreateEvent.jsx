import React, { useState } from 'react';
import axios from 'axios';

const CreateEvent = ({ onEventAdded }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(''); // Updated here
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        
        if (!token) {
          setMessage('User not authenticated');
          return;
        }
      
        try {
          const response = await axios.post('http://localhost:5000/events', 
            { title, date, description }, 
            {
              headers: {
                Authorization: `Bearer ${token}`,  // Attach token to Authorization header
              },
            });
            
          setMessage('Event created successfully!');
          setTitle('');
          setDate('');
          setDescription('');

          onEventAdded(response.data);  // Update the events list in the parent component
        } catch (error) {
          setMessage(error.response?.data?.error || 'Error creating event');
          console.error('Error creating event:', error.response?.data); // Log error details
        }
      };
  
    return (
      <form onSubmit={handleCreateEvent}>
        <h2 className='font-bold text-3xl my-4'>Create Event</h2>
        <div className='my-6'>
          <label className='font-bold text-2xl my-2 mr-4'>Title:</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}  className='bg-stone-200 w-1/2 ml-[90px] p-2 rounded-md' />
        </div>
        <div className=''>
          <label className='font-bold text-2xl my-2 mr-4'>Date & Time:</label>
          <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required  className='bg-stone-200 w-1/2 p-2 rounded-md'/>
        </div>
        <div className='my-4'>
          <label className='font-bold text-2xl mr-4'>Description:</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className='bg-stone-200 ml-[10px] w-1/2 p-2 rounded-md'/>
        </div>
        <div className='flex justify-end text-gray-700'>
          <button type="submit" className='bg-green-400 px-4 py-4 rounded-md font-bold my-4'>Create Event</button>
        </div>
        {message && <p>{message}</p>}
      </form>
    );
  };
  
export default CreateEvent;
