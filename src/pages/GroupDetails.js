import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonButton, IonIcon, IonSegment, IonSegmentButton, IonSpinner, IonText, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonBadge, IonFab, IonFabButton, useIonToast, useIonActionSheet, IonItemSliding, IonItemOptions, IonItemOption, useIonViewWillEnter, } from '@ionic/react';
import { peopleOutline, calendarOutline, settingsOutline, addOutline, personAddOutline, timeOutline, ellipsisHorizontal, locationOutline, linkOutline, createOutline, trashOutline, } from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import AppHeader from '../components/AppHeader';
import MarkdownViewer from '../components/MarkdownViewer';
import MarkdownEditor from '../components/MarkdownEditor';
const GroupDetailsPage = () => {
    const { groupId } = useParams();
    const history = useHistory();
    const [groupDetails, setGroupDetails] = useState(null);
    const [members, setMembers] = useState([]);
    const [activeTab, setActiveTab] = useState('details');
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [present] = useIonToast();
    const [presentActionSheet] = useIonActionSheet();
    const [isEditing, setIsEditing] = useState(false);
    const [activities, setActivities] = useState([]);
    const [selectedActivity, setSelectedActivity] = useState(null);
    useIonViewWillEnter(() => {
        loadGroupData();
        if (activeTab === 'activities') {
            loadActivities();
        }
    });
    useEffect(() => {
        loadGroupData();
    }, [groupId]);
    useEffect(() => {
        if (activeTab === 'activities') {
            loadActivities();
        }
    }, [activeTab, groupId]);
    const loadGroupData = async () => {
        if (!groupId)
            return;
        try {
            // First get members to get accurate count
            const { data: membersData, error: membersError } = await supabase
                .from('group_members')
                .select('role, profiles:profiles(id, email, username, created_at)')
                .eq('group_id', groupId);
            if (membersError)
                throw membersError;
            const formattedMembers = membersData.map(member => ({
                ...member.profiles,
                role: member.role
            }));
            setMembers(formattedMembers);
            // Load group details and activity count
            const { data: groupData, error: groupError } = await supabase
                .from('groups')
                .select('*, activities(count)')
                .eq('id', groupId)
                .single();
            if (groupError)
                throw groupError;
            // Set group details with correct member count
            setGroupDetails({
                ...groupData,
                member_count: formattedMembers.length,
                activity_count: groupData.activities?.[0]?.count || 0
            });
        }
        catch (error) {
            present({
                message: error.message || 'Failed to load group data',
                duration: 3000,
                position: 'top',
                color: 'danger'
            });
        }
        finally {
            setLoading(false);
        }
    };
    const loadActivities = async () => {
        if (!groupId)
            return;
        try {
            const { data, error } = await supabase
                .from('activities')
                .select('*')
                .eq('group_id', groupId)
                .gte('date', new Date().toISOString())
                .order('date', { ascending: true });
            if (error)
                throw error;
            setActivities(data || []);
        }
        catch (error) {
            present({
                message: error.message || 'Failed to load activities',
                duration: 3000,
                position: 'top',
                color: 'danger'
            });
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
    const isUserAdmin = members.find(m => m.id === user?.id)?.role === 'admin';
    const handleMemberOptions = (member) => {
        if (!isUserAdmin || member.id === user?.id)
            return;
        presentActionSheet({
            header: `Manage ${member.username}`,
            buttons: [
                {
                    text: member.role === 'admin' ? 'Remove Admin Role' : 'Make Admin',
                    handler: () => updateMemberRole(member.id, member.role === 'admin' ? 'member' : 'admin')
                },
                {
                    text: 'Remove from Group',
                    role: 'destructive',
                    handler: () => removeMember(member.id)
                },
                {
                    text: 'Cancel',
                    role: 'cancel'
                }
            ]
        });
    };
    const updateMemberRole = async (memberId, newRole) => {
        try {
            const { error } = await supabase
                .from('group_members')
                .update({ role: newRole })
                .eq('group_id', groupId)
                .eq('user_id', memberId);
            if (error)
                throw error;
            setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));
            present({
                message: 'Role updated successfully',
                duration: 2000,
                position: 'top',
                color: 'success'
            });
        }
        catch (error) {
            present({
                message: error.message || 'Failed to update role',
                duration: 3000,
                position: 'top',
                color: 'danger'
            });
        }
    };
    const removeMember = async (memberId) => {
        try {
            const { error } = await supabase
                .from('group_members')
                .delete()
                .eq('group_id', groupId)
                .eq('user_id', memberId);
            if (error)
                throw error;
            setMembers(members.filter(m => m.id !== memberId));
            present({
                message: 'Member removed successfully',
                duration: 2000,
                position: 'top',
                color: 'success'
            });
        }
        catch (error) {
            present({
                message: error.message || 'Failed to remove member',
                duration: 3000,
                position: 'top',
                color: 'danger'
            });
        }
    };
    const handleSaveDescription = async (newDescription) => {
        if (!groupId || !groupDetails?.name) {
            present({
                message: 'Group information is missing',
                duration: 3000,
                position: 'top',
                color: 'danger'
            });
            return;
        }
        try {
            const { error } = await supabase
                .from('groups')
                .upsert({
                id: groupId,
                name: groupDetails.name,
                description: newDescription
            })
                .select()
                .single();
            if (error)
                throw error;
            // Update local state
            setGroupDetails(prev => prev ? { ...prev, description: newDescription } : null);
            setIsEditing(false);
            present({
                message: 'Description updated successfully',
                duration: 2000,
                position: 'top',
                color: 'success'
            });
        }
        catch (error) {
            console.error('Error updating description:', error);
            present({
                message: error.message || 'Failed to update description',
                duration: 3000,
                position: 'top',
                color: 'danger'
            });
        }
    };
    const handleActivityClick = (activity) => {
        setSelectedActivity(activity);
    };
    const handleCloseActivity = () => {
        setSelectedActivity(null);
    };
    const handleDeleteActivity = async (activityId) => {
        try {
            const { error } = await supabase
                .from('activities')
                .delete()
                .eq('id', activityId);
            if (error)
                throw error;
            // Update local state
            setActivities(activities.filter(a => a.id !== activityId));
            setSelectedActivity(null);
            present({
                message: 'Activity deleted successfully',
                duration: 2000,
                position: 'top',
                color: 'success'
            });
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
    if (loading) {
        return (_jsxs(IonPage, { children: [_jsx(AppHeader, { title: "Group", showBackButton: true }), _jsx(IonContent, { children: _jsx("div", { className: "ion-text-center ion-padding", children: _jsx(IonSpinner, {}) }) })] }));
    }
    return (_jsxs(IonPage, { children: [_jsx(AppHeader, { title: groupDetails?.name || 'Group', showBackButton: true }), _jsxs(IonContent, { children: [_jsxs(IonSegment, { value: activeTab, onIonChange: e => setActiveTab(e.detail.value), children: [_jsxs(IonSegmentButton, { value: "details", children: [_jsx(IonIcon, { icon: settingsOutline }), _jsx(IonLabel, { children: "Details" })] }), _jsxs(IonSegmentButton, { value: "members", children: [_jsx(IonIcon, { icon: peopleOutline }), _jsxs(IonLabel, { children: ["Members", _jsx(IonBadge, { color: "primary", className: "ion-margin-start", children: groupDetails?.member_count || 0 })] })] }), _jsxs(IonSegmentButton, { value: "activities", children: [_jsx(IonIcon, { icon: calendarOutline }), _jsxs(IonLabel, { children: ["Activities", _jsx(IonBadge, { color: "primary", className: "ion-margin-start", children: groupDetails?.activity_count || 0 })] })] })] }), activeTab === 'details' && (_jsx("div", { className: "ion-padding", children: isEditing ? (_jsx(MarkdownEditor, { content: groupDetails?.description || '', onSave: handleSaveDescription, onCancel: () => setIsEditing(false) })) : (_jsx(MarkdownViewer, { content: groupDetails?.description || '', onEdit: () => setIsEditing(true), canEdit: isUserAdmin })) })), activeTab === 'members' && (_jsxs(_Fragment, { children: [_jsx(IonList, { children: members.map(member => (_jsxs(IonItemSliding, { children: [_jsxs(IonItem, { button: true, onClick: () => handleMemberOptions(member), children: [_jsxs(IonLabel, { children: [_jsx("h2", { children: member.username }), _jsx("p", { children: member.email })] }), _jsx(IonBadge, { color: member.role === 'admin' ? 'success' : 'medium', slot: "end", children: member.role }), isUserAdmin && member.id !== user?.id && (_jsx(IonIcon, { icon: ellipsisHorizontal, slot: "end" }))] }), isUserAdmin && member.id !== user?.id && (_jsxs(IonItemOptions, { side: "end", children: [_jsx(IonItemOption, { color: member.role === 'admin' ? 'medium' : 'primary', onClick: () => updateMemberRole(member.id, member.role === 'admin' ? 'member' : 'admin'), children: member.role === 'admin' ? 'Make Member' : 'Make Admin' }), _jsx(IonItemOption, { color: "danger", onClick: () => removeMember(member.id), children: "Remove" })] }))] }, member.id))) }), isUserAdmin && (_jsx(IonFab, { vertical: "bottom", horizontal: "end", slot: "fixed", children: _jsx(IonFabButton, { children: _jsx(IonIcon, { icon: personAddOutline }) }) }))] })), activeTab === 'activities' && (_jsx("div", { className: "ion-padding", children: selectedActivity ? (_jsxs(_Fragment, { children: [_jsxs(IonCard, { children: [_jsxs(IonCardHeader, { children: [_jsx(IonCardTitle, { children: selectedActivity.title }), _jsx(IonCardSubtitle, { children: formatDate(selectedActivity.date) })] }), _jsxs(IonCardContent, { children: [_jsxs(IonItem, { lines: "none", children: [_jsx(IonIcon, { icon: timeOutline, slot: "start" }), _jsx(IonLabel, { children: formatDate(selectedActivity.date) })] }), selectedActivity.location && (_jsxs(IonItem, { lines: "none", children: [_jsx(IonIcon, { icon: locationOutline, slot: "start" }), _jsx(IonLabel, { children: selectedActivity.location })] })), selectedActivity.url && (_jsxs(IonItem, { lines: "none", href: selectedActivity.url, target: "_blank", children: [_jsx(IonIcon, { icon: linkOutline, slot: "start" }), _jsx(IonLabel, { children: "Meeting Link" })] }))] })] }), selectedActivity.description && (_jsx("div", { className: "ion-margin-top", children: _jsx(MarkdownViewer, { content: selectedActivity.description }) })), selectedActivity.notes && (_jsxs(IonCard, { className: "ion-margin-top", children: [_jsx(IonCardHeader, { children: _jsx(IonCardTitle, { children: "Notes" }) }), _jsx(IonCardContent, { children: _jsx(MarkdownViewer, { content: selectedActivity.notes }) })] })), _jsxs("div", { className: "ion-padding", children: [_jsx(IonButton, { expand: "block", onClick: handleCloseActivity, children: "Back to Activities" }), isUserAdmin && (_jsxs(_Fragment, { children: [_jsxs(IonButton, { expand: "block", color: "primary", onClick: () => history.push(`/tabs/activities/${selectedActivity.id}/edit`), children: [_jsx(IonIcon, { slot: "start", icon: createOutline }), "Edit Activity"] }), _jsxs(IonButton, { expand: "block", color: "danger", onClick: () => handleDeleteActivity(selectedActivity.id), children: [_jsx(IonIcon, { slot: "start", icon: trashOutline }), "Delete Activity"] })] }))] })] })) : (_jsxs(_Fragment, { children: [activities.length === 0 ? (_jsxs("div", { className: "ion-text-center", children: [_jsx(IonIcon, { icon: calendarOutline, style: { fontSize: '64px', color: 'var(--ion-color-medium)' } }), _jsxs(IonText, { color: "medium", children: [_jsx("p", { children: "No upcoming activities" }), _jsx("p", { children: "Create one to get started!" })] })] })) : (_jsx(IonList, { children: activities.map(activity => (_jsxs(IonItemSliding, { children: [_jsx(IonItem, { button: true, onClick: () => history.push(`/tabs/activities/${activity.id}`), children: _jsxs(IonLabel, { children: [_jsx("h2", { children: activity.title }), _jsx("p", { children: formatDate(activity.date) }), activity.location && _jsx("p", { children: activity.location })] }) }), _jsxs(IonItemOptions, { side: "end", children: [_jsxs(IonItemOption, { color: "primary", onClick: () => history.push(`/tabs/activities/${activity.id}`), children: [_jsx(IonIcon, { slot: "start", icon: createOutline }), "Details"] }), isUserAdmin && (_jsxs(IonItemOption, { color: "danger", onClick: () => handleDeleteActivity(activity.id), children: [_jsx(IonIcon, { slot: "start", icon: trashOutline }), "Delete"] }))] })] }, activity.id))) })), isUserAdmin && (_jsx(IonFab, { vertical: "bottom", horizontal: "end", slot: "fixed", children: _jsx(IonFabButton, { onClick: () => history.push(`/tabs/groups/${groupId}/activities/new`), children: _jsx(IonIcon, { icon: addOutline }) }) }))] })) }))] })] }));
};
export default GroupDetailsPage;
