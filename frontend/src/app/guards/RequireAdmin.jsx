import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider.jsx';
import LoadingScreen from '~/components/ui/LoadingScreen.jsx';

const AdminRoutes = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search + location.hash }} />;
  return user.vaiTro === 'ADMIN' ? children : <Navigate to="/profile" replace />;
};

export default AdminRoutes;
