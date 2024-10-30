import Register from '../components/Register';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black/90">
      <div className="bg-white p-8 shadow-md rounded-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        <Register />
        <p className="mt-4 text-center">
          Already have an account? <Link to="/" className="text-blue-500">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
