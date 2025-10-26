import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useSelector } from 'react-redux';
import Layout from './layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Coach from './pages/Coach';
import MyTeam from './pages/MyTeam';
import Leagues from './pages/Leagues';
import Teams from './pages/Teams';
import Players from './pages/Players';
import Fixtures from './pages/Fixtures';
import Results from './pages/Results';
import Referees from './pages/Referees';
import Venues from './pages/Venues';
import Users from './pages/Users';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin-only Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/leagues" />;
  }
  return children;
};

// Coach-only Route Component
const CoachRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if (user?.role !== 'COACH') {
    return <Navigate to="/leagues" />;
  }
  return children;
};

// Public Route Component (redirect to appropriate page if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  if (!isAuthenticated) {
    return children;
  }
  // Redirect to dashboard for admins, coach page for coaches, leagues for others
  return user?.role === 'ADMIN' ? <Navigate to="/dashboard" /> : 
         user?.role === 'COACH' ? <Navigate to="/coach" /> : 
         <Navigate to="/leagues" />;
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
            <Route index element={<Navigate to="/leagues" />} />
            <Route path="dashboard" element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            } />
            <Route path="coach" element={
              <CoachRoute>
                <Coach />
              </CoachRoute>
            } />
            <Route path="my-team" element={
              <CoachRoute>
                <MyTeam />
              </CoachRoute>
            } />
              <Route path="leagues" element={<Leagues />} />
              <Route path="teams" element={<Teams />} />
              <Route path="players" element={<Players />} />
              <Route path="fixtures" element={<Fixtures />} />
              <Route path="results" element={<Results />} />
              <Route path="referees" element={<Referees />} />
            <Route path="venues" element={<Venues />} />
            <Route path="users" element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            } />
            </Route>
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
