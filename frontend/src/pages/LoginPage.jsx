import Login from '../components/Login';
import { Link } from 'react-router-dom';

const LoginPage = ({ setAuth }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black/90">
      <div className="bg-white p-8 shadow-md rounded-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <Login setAuth={setAuth} />
        <p className="mt-4 text-center">
          Don’t have an account? <Link to="/register" className="text-blue-500">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
