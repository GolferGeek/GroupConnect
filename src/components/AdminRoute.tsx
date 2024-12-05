import { Route, Redirect, RouteProps } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps extends Omit<RouteProps, 'component'> {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children, ...rest }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return null;

  return (
    <Route
      {...rest}
      render={props =>
        user && profile?.role_id === 'admin' ? (
          children
        ) : user ? (
          // If user is logged in but not admin, redirect to home
          <Redirect to="/home" />
        ) : (
          // If user is not logged in, redirect to login
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default AdminRoute; 