import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserGroupIcon } from '@heroicons/react/24/outline';

const Register = () => {
  const navigate = useNavigate();

  // Automatically redirect to home page when someone tries to register
  useEffect(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-12 text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <UserGroupIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-white">
              Registration Disabled
            </h2>
            <p className="mt-2 text-red-100">
              New registrations are currently not available
            </p>
          </div>
          <div className="px-8 py-8 text-center">
            <p className="text-gray-600 mb-6">
              Registration is temporarily disabled. Please contact an administrator if you need access.
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-green-700 transition-all duration-300"
            >
              Return to Home
                </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

