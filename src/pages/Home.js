import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { IonContent, IonPage, IonIcon, IonText, useIonToast, } from '@ionic/react';
import { personCircleOutline } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../services/database';
import AppHeader from '../components/AppHeader';
import './Home.css';
const Home = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [present] = useIonToast();
    useEffect(() => {
        if (user) {
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
    }, [user]);
    return (_jsxs(IonPage, { children: [_jsx(AppHeader, { title: "GroupConnect" }), _jsxs(IonContent, { className: "ion-padding", children: [_jsxs("div", { className: "ion-text-center ion-padding", children: [_jsx(IonIcon, { icon: personCircleOutline, style: { fontSize: '64px', color: 'var(--ion-color-medium)' } }), _jsxs(IonText, { children: [_jsxs("h2", { children: ["Welcome, ", profile?.username || 'User', "!"] }), _jsx("p", { children: profile?.email })] })] }), _jsx("div", { className: "ion-padding", children: _jsx("p", { className: "ion-text-center", children: "Start by creating a group or joining one through an invitation." }) })] })] }));
};
export default Home;
