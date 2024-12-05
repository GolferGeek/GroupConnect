import React from 'react';
import { Route, RouteProps, Redirect } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps extends RouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children, ...rest }) => {
  const { user, profile } = useAuth();

  return (
    <Route
      {...rest}
      render={props =>
        user && profile?.role_id === 1 ? (
          children
        ) : user ? (
          // If user is logged in but not admin, redirect to home
          <Redirect
            to={{
              pathname: "/home",
              state: { from: props.location }
            }}
          />
        ) : (
          // If user is not logged in, redirect to login
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location }
            }}
          />
        )
      }
    />
  );
};

export default AdminRoute; 