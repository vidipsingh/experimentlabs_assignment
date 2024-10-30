import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventPage from './pages/EventPage';
import { useState, useEffect } from 'react';

function App() {
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    // Check if token exists in localStorage to maintain authentication state
    const token = localStorage.getItem('token');
    if (token) {
      setAuth(true);
    }
  }, []);

  const handleLogout = () => {
    // Remove token from localStorage and set auth to false
    localStorage.removeItem('token');
    setAuth(false);
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={auth ? <Navigate to="/events" /> : <LoginPage setAuth={setAuth} />} />
        <Route path="/register" element={auth ? <Navigate to="/events" /> : <RegisterPage />} />

        {/* Protected Route */}
        <Route path="/events" element={auth ? <EventPage handleLogout={handleLogout} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
