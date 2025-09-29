// client/src/components/ProtectedRoute.tsx
import type { ReactNode, FC } from 'react'; // Import ReactNode
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../App';

// Define the component using React.PropsWithChildren
const ProtectedRoute: React.FC<React.PropsWithChildren> = () => {
  const auth = useAuth();
  
  if (auth?.loading) {
    return <div>Loading...</div>; // Show a loading indicator
  }

  if (!auth?.token) {
    return <Navigate to="/" replace />; // Redirect if not authenticated
  }

  return <Outlet />; // Render the nested child routes
};

export default ProtectedRoute;

