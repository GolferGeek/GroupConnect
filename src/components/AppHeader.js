import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonBackButton, useIonToast, IonText, } from '@ionic/react';
import { logOutOutline } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../services/database';
import { useHistory } from 'react-router-dom';
const AppHeader = ({ title, showBackButton = false }) => {
    const { user, session, signOut } = useAuth();
    const [profile, setProfile] = useState(null);
    const history = useHistory();
    const [present] = useIonToast();
    useEffect(() => {
        if (user && session) {
            getUserProfile(user.id)
                .then(setProfile)
                .catch(error => {
                present({
                    message: 'Failed to load profile',
                    duration: 3000,
                    position: 'top',
                    color: 'danger'
                });
            });
        }
    }, [user, session]);
    const handleSignOut = async () => {
        try {
            await signOut();
            window.location.href = '/login';
        }
        catch (error) {
            present({
                message: error.message || 'Failed to sign out',
                duration: 3000,
                position: 'top',
                color: 'danger'
            });
        }
    };
    return (_jsx(IonHeader, { children: _jsxs(IonToolbar, { children: [showBackButton && (_jsx(IonButtons, { slot: "start", children: _jsx(IonBackButton, { defaultHref: "/groups" }) })), _jsx(IonTitle, { children: title }), session && (_jsxs(IonButtons, { slot: "end", children: [_jsx(IonText, { color: "medium", className: "ion-padding-end", children: profile?.username || 'User' }), _jsx(IonButton, { onClick: handleSignOut, children: _jsx(IonIcon, { slot: "icon-only", icon: logOutOutline }) })] }))] }) }));
};
export default AppHeader;
