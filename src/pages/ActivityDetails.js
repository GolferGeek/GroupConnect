import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { IonContent, IonPage, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonIcon, IonSpinner, IonItem, IonLabel, IonBadge, useIonToast, useIonActionSheet, } from '@ionic/react';
import { locationOutline, timeOutline, linkOutline, createOutline, trashOutline, ellipsisHorizontal, } from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import AppHeader from '../components/AppHeader';
import MarkdownViewer from '../components/MarkdownViewer';
const ActivityDetails = () => {
    const { activityId } = useParams();
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const { user } = useAuth();
    const history = useHistory();
    const [present] = useIonToast();
    const [presentActionSheet] = useIonActionSheet();
    useEffect(() => {
        loadActivityData();
    }, [activityId]);
    const loadActivityData = async () => {
        if (!activityId || !user)
            return;
        try {
            // Get activity details
            const { data: activityData, error: activityError } = await supabase
                .from('activities')
                .select('*, group:groups(name)')
                .eq('id', activityId)
                .single();
            if (activityError)
                throw activityError;
            setActivity(activityData);
            // Check if user is admin of the group
            const { data: memberData, error: memberError } = await supabase
                .from('group_members')
                .select('role')
                .eq('group_id', activityData.group_id)
                .eq('user_id', user.id)
                .single();
            if (memberError)
                throw memberError;
            setIsAdmin(memberData.role === 'admin');
        }
        catch (error) {
            present({
                message: error.message || 'Failed to load activity',
                duration: 3000,
                position: 'top',
                color: 'danger'
            });
            history.goBack();
        }
        finally {
            setLoading(false);
        }
    };
    const handleOptions = () => {
        if (!isAdmin)
            return;
        presentActionSheet({
            header: 'Activity Options',
            buttons: [
                {
                    text: 'Edit Activity',
                    icon: createOutline,
                    handler: () => history.push(`/tabs/activities/${activityId}/edit`)
                },
                {
                    text: 'Delete Activity',
                    icon: trashOutline,
                    role: 'destructive',
                    handler: handleDelete
                },
                {
                    text: 'Cancel',
                    role: 'cancel'
                }
            ]
        });
    };
    const handleDelete = async () => {
        try {
            const { error } = await supabase
                .from('activities')
                .delete()
                .eq('id', activityId);
            if (error)
                throw error;
            present({
                message: 'Activity deleted successfully',
                duration: 2000,
                position: 'top',
                color: 'success'
            });
            // Navigate back to the group if we have group_id
            if (activity?.group_id) {
                history.replace(`/tabs/groups/${activity.group_id}`);
            }
            else {
                history.replace('/tabs/activities');
            }
        }
        catch (error) {
            present({
                message: error.message || 'Failed to delete activity',
                duration: 3000,
                position: 'top',
                color: 'danger'
            });
        }
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    if (loading) {
        return (_jsxs(IonPage, { children: [_jsx(AppHeader, { title: "Activity", showBackButton: true }), _jsx(IonContent, { children: _jsx("div", { className: "ion-text-center ion-padding", children: _jsx(IonSpinner, {}) }) })] }));
    }
    if (!activity)
        return null;
    return (_jsxs(IonPage, { children: [_jsx(AppHeader, { title: activity.title, showBackButton: true, actions: isAdmin ? [
                    {
                        icon: ellipsisHorizontal,
                        handler: handleOptions
                    }
                ] : undefined }), _jsxs(IonContent, { className: "ion-padding", children: [_jsxs(IonCard, { children: [_jsxs(IonCardHeader, { children: [_jsx(IonCardTitle, { children: activity.title }), _jsx(IonCardSubtitle, { children: _jsx(IonBadge, { color: "primary", className: "ion-margin-end", children: activity.group.name }) })] }), _jsxs(IonCardContent, { children: [_jsxs(IonItem, { lines: "none", children: [_jsx(IonIcon, { icon: timeOutline, slot: "start" }), _jsx(IonLabel, { children: formatDate(activity.date) })] }), activity.location && (_jsxs(IonItem, { lines: "none", children: [_jsx(IonIcon, { icon: locationOutline, slot: "start" }), _jsx(IonLabel, { children: activity.location })] })), activity.url && (_jsxs(IonItem, { lines: "none", href: activity.url, target: "_blank", children: [_jsx(IonIcon, { icon: linkOutline, slot: "start" }), _jsx(IonLabel, { children: "Meeting Link" })] }))] })] }), activity.description && (_jsx("div", { className: "ion-margin-top", children: _jsx(MarkdownViewer, { content: activity.description }) })), activity.notes && (_jsxs(IonCard, { className: "ion-margin-top", children: [_jsx(IonCardHeader, { children: _jsx(IonCardTitle, { children: "Notes" }) }), _jsx(IonCardContent, { children: _jsx(MarkdownViewer, { content: activity.notes }) })] }))] })] }));
};
export default ActivityDetails;
