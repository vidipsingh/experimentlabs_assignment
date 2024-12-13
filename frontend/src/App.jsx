import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventPage from './pages/EventPage';
import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

const CLIENT_ID = import.meta.env.VITE_APP_GOOGLE_CLIENT_ID;
function App() {
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuth(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth(false);
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={auth ? <Navigate to="/events" /> : <LoginPage setAuth={setAuth} />} />
          <Route path="/register" element={auth ? <Navigate to="/events" /> : <RegisterPage />} />

          {/* Protected Route */}
          <Route path="/events" element={auth ? <EventPage handleLogout={handleLogout} /> : <Navigate to="/" />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;