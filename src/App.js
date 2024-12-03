import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Redirect, Route } from 'react-router-dom';
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
const PrivateRoute = ({ component: Component, ...rest }) => {
    const { user, loading } = useAuth();
    return (_jsx(Route, { ...rest, render: props => loading ? null : user ? _jsx(Component, { ...props }) : _jsx(Redirect, { to: "/login" }) }));
};
const AppContent = () => (_jsx(IonApp, { children: _jsx(IonReactRouter, { children: _jsxs(IonRouterOutlet, { children: [_jsx(Route, { exact: true, path: "/login", children: _jsx(Login, {}) }), _jsx(PrivateRoute, { exact: true, path: "/home", component: Home }), _jsx(PrivateRoute, { path: "/tabs", component: MainTabs }), _jsx(Redirect, { exact: true, from: "/", to: "/tabs" })] }) }) }));
const App = () => (_jsx(AuthProvider, { children: _jsx(AppContent, {}) }));
export default App;
