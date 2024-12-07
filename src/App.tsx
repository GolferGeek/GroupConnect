import { Redirect, Route, RouteProps } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact, IonSpinner } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import Login from './pages/Login';
import Groups from './pages/Groups';
import GroupDetails from './pages/GroupDetails';
import MainTabs from './pages/MainTabs';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Discover from './pages/Discover';
import Activities from './pages/Activities';
import ActivityDetails from './pages/ActivityDetails';
import CreateActivity from './pages/CreateActivity';
import EditActivity from './pages/EditActivity';
import RoleManager from './pages/RoleManager';
import TypeManager from './pages/TypeManager';
import Profile from './pages/Profile';
import AdminRoute from './components/AdminRoute';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

interface PrivateRouteProps extends Omit<RouteProps, 'component'> {
  children: React.ReactNode;
}

const LoginRoute: React.FC = () => {
  const { user } = useAuth();
  return user ? <Redirect to="/groups" /> : <Login />;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, ...rest }) => {
  const { user, loading } = useAuth();

  return (
    <Route
      {...rest}
      render={props =>
        loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh' 
          }}>
            <IonSpinner />
          </div>
        ) : user ? (
          children
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

const App: React.FC = () => {
  return (
    <IonApp>
      <AuthProvider>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route exact path="/login" component={LoginRoute} />

            {/* Group and Activity routes - most specific first */}
            <PrivateRoute exact path="/groups/:groupId/activities/:activityId/edit">
              <EditActivity />
            </PrivateRoute>
            <PrivateRoute exact path="/groups/:groupId/activities/:activityId">
              <ActivityDetails />
            </PrivateRoute>
            <PrivateRoute exact path="/groups/:groupId/activities/new">
              <CreateActivity />
            </PrivateRoute>
            <PrivateRoute exact path="/groups/:id">
              <GroupDetails />
            </PrivateRoute>
            <PrivateRoute exact path="/groups">
              <MainTabs />
            </PrivateRoute>

            {/* Other routes */}
            <PrivateRoute exact path="/discover">
              <MainTabs />
            </PrivateRoute>
            <PrivateRoute exact path="/activities">
              <MainTabs />
            </PrivateRoute>
            <PrivateRoute exact path="/home">
              <MainTabs />
            </PrivateRoute>
            <Route exact path="/role-manager" component={RoleManager} />
            <AdminRoute exact path="/type-manager">
              <TypeManager />
            </AdminRoute>
            <PrivateRoute exact path="/profile">
              <Profile />
            </PrivateRoute>
            <Route exact path="/">
              <Redirect to="/groups" />
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
      </AuthProvider>
    </IonApp>
  );
};

export default App;
