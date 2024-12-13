import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { GoogleLogin } from '@react-oauth/google';

const Login = ({ setAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      setAuth(true);
      navigate('/events');
    } catch (error) {
      setError('Invalid credentials');
    }
  };

  const handleSuccess = async (credentialResponse) => {
    try {
      // Instead of making a POST request to /auth/google/callback,
      // make a POST request to a new endpoint that handles the token
      const response = await axios.post(`${API_URL}/auth/google/verify`, {
        credential: credentialResponse.credential,
      });

      localStorage.setItem('token', response.data.token);
      setAuth(true);
      navigate('/events'); // Add this to redirect after successful login
    } catch (error) {
      console.error('Error during Google login:', error);
      setError('Google login failed');
    }
  };

  const handleError = () => {
    console.log('Login Failed');
  };

  return (
    <form onSubmit={handleLogin}>
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700">Email</label>
        <input
          type="email"
          id="email"
          className="w-full p-2 border border-gray-300 rounded mt-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb-4 relative">
        <label htmlFor="password" className="block text-gray-700">Password</label>
        <input
          type={showPassword ? 'text' : 'password'}
          id="password"
          className="w-full p-2 border border-gray-300 rounded mt-1"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <span 
          onClick={() => setShowPassword(!showPassword)} 
          className="absolute right-3 top-9 mt-0.5 cursor-pointer">
          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
        </span>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded mb-4">Login</button>

      <GoogleLogin 
        onSuccess={handleSuccess}
        onError={handleError}
      />
      {error && <p>{error}</p>}
    </form>
  );
};

Login.propTypes = {
  setAuth: PropTypes.func.isRequired,
};

export default Login;
