import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonIcon, IonSpinner, IonText, IonBadge, useIonToast, } from '@ionic/react';
import { calendarOutline } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { useHistory } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
const Activities = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const history = useHistory();
    const [present] = useIonToast();
    useEffect(() => {
        loadActivities();
    }, [user]);
    const loadActivities = async () => {
        if (!user)
            return;
        try {
            // Get activities from all groups the user is a member of
            const { data, error } = await supabase
                .from('activities')
                .select(`
          *,
          group:groups(id, name)
        `)
                .gte('date', new Date().toISOString()) // Only future activities
                .order('date', { ascending: true });
            if (error)
                throw error;
            setActivities(data || []);
        }
        catch (error) {
            present({
                message: 'Failed to load activities',
                duration: 3000,
                position: 'top',
                color: 'danger'
            });
        }
        finally {
            setLoading(false);
        }
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    if (loading) {
        return (_jsxs(IonPage, { children: [_jsx(AppHeader, { title: "Activities" }), _jsx(IonContent, { children: _jsx("div", { className: "ion-text-center ion-padding", children: _jsx(IonSpinner, {}) }) })] }));
    }
    return (_jsxs(IonPage, { children: [_jsx(AppHeader, { title: "Activities" }), _jsx(IonContent, { children: activities.length === 0 ? (_jsxs("div", { className: "ion-text-center ion-padding", children: [_jsx(IonIcon, { icon: calendarOutline, style: { fontSize: '64px', color: 'var(--ion-color-medium)' } }), _jsxs(IonText, { children: [_jsx("p", { children: "No upcoming activities found." }), _jsx("p", { children: "Join a group or create activities to get started!" })] })] })) : (_jsx(IonList, { children: activities.map(activity => (_jsxs(IonItem, { button: true, onClick: () => history.push(`/tabs/activities/${activity.id}`), children: [_jsxs(IonLabel, { children: [_jsx("h2", { children: activity.title }), _jsx("p", { children: formatDate(activity.date) }), activity.location && _jsx("p", { children: activity.location })] }), _jsx(IonBadge, { color: "primary", slot: "end", children: activity.group.name })] }, activity.id))) })) })] }));
};
export default Activities;
