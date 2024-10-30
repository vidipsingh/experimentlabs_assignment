import axios from 'axios';
import { getToken } from './auth';

const API_URL = 'http://localhost:5000';

export const createEvent = async (title, date, description) => {
  const token = getToken();
  const response = await axios.post(`${API_URL}/events`, {
    title, date, description, userId: 1 // replace with actual userId
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getEvents = async () => {
  const token = getToken();
  const response = await axios.get(`${API_URL}/events?userId=1`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
