import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const register = async (email, password) => {
  const response = await axios.post(`${API_URL}/register`, { email, password });
  return response.data;
};

export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  localStorage.setItem('token', response.data.token);
  return response.data;
};

export const getToken = () => localStorage.getItem('token');
