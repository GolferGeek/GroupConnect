import { Redirect, Route, RouteProps } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import Login from './pages/Login';
import MainTabs from './pages/MainTabs';
import { AuthProvider, useAuth } from './contexts/AuthContext';

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

const PrivateRoute: React.FC<{ component: React.ComponentType } & RouteProps> = ({
  component: Component,
  ...rest
}) => {
  const { user, loading } = useAuth();

  return (
    <Route
      {...rest}
      render={props =>
        loading ? null : user ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
};

const AppContent: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/login">
          <Login />
        </Route>
        <PrivateRoute exact path="/home" component={Home} />
        <PrivateRoute path="/tabs" component={MainTabs} />
        <Redirect exact from="/" to="/tabs/groups" />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
