import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonButton, IonIcon, IonFab, IonFabButton, IonModal, IonInput, IonButtons, useIonToast, IonSpinner, IonText, IonToolbar, IonTitle, IonHeader, } from '@ionic/react';
import { addOutline, peopleOutline } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { createGroup, getUserGroups } from '../services/database';
import { useHistory } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [creating, setCreating] = useState(false);
    const { user } = useAuth();
    const history = useHistory();
    const [present] = useIonToast();
    useEffect(() => {
        loadGroups();
    }, [user]);
    const loadGroups = async () => {
        if (!user)
            return;
        try {
            const userGroups = await getUserGroups(user.id);
            setGroups(userGroups);
        }
        catch (error) {
            present({
                message: 'Failed to load groups',
                duration: 3000,
                position: 'top',
                color: 'danger'
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreateGroup = async () => {
        if (!user || !newGroupName.trim())
            return;
        setCreating(true);
        try {
            const group = await createGroup(newGroupName.trim(), user.id);
            setGroups([...groups, group]);
            setIsModalOpen(false);
            setNewGroupName('');
            history.push(`/tabs/groups/${group.id}`);
        }
        catch (error) {
            present({
                message: 'Failed to create group',
                duration: 3000,
                position: 'top',
                color: 'danger'
            });
        }
        finally {
            setCreating(false);
        }
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setNewGroupName('');
    };
    return (_jsxs(IonPage, { children: [_jsx(AppHeader, { title: "My Groups" }), _jsxs(IonContent, { children: [loading ? (_jsx("div", { className: "ion-text-center ion-padding", children: _jsx(IonSpinner, {}) })) : groups.length === 0 ? (_jsxs("div", { className: "ion-text-center ion-padding", children: [_jsx(IonIcon, { icon: peopleOutline, style: { fontSize: '64px', color: 'var(--ion-color-medium)' } }), _jsxs(IonText, { children: [_jsx("p", { children: "You haven't joined any groups yet." }), _jsx("p", { children: "Create one to get started!" })] })] })) : (_jsx(IonList, { children: groups.map(group => (_jsx(IonItem, { button: true, onClick: () => history.push(`/tabs/groups/${group.id}`), children: _jsx(IonLabel, { children: _jsx("h2", { children: group.name }) }) }, group.id))) })), _jsx(IonFab, { vertical: "bottom", horizontal: "end", slot: "fixed", children: _jsx(IonFabButton, { onClick: () => setIsModalOpen(true), children: _jsx(IonIcon, { icon: addOutline }) }) }), _jsxs(IonModal, { isOpen: isModalOpen, onDidDismiss: closeModal, presentingElement: document.querySelector('ion-page'), children: [_jsx(IonHeader, { children: _jsxs(IonToolbar, { children: [_jsx(IonTitle, { children: "Create New Group" }), _jsx(IonButtons, { slot: "end", children: _jsx(IonButton, { onClick: closeModal, children: "Cancel" }) })] }) }), _jsx(IonContent, { className: "ion-padding", children: _jsxs("form", { onSubmit: (e) => {
                                        e.preventDefault();
                                        handleCreateGroup();
                                    }, children: [_jsxs(IonItem, { children: [_jsx(IonLabel, { position: "stacked", children: "Group Name" }), _jsx(IonInput, { value: newGroupName, onIonChange: e => setNewGroupName(e.detail.value), placeholder: "Enter group name", disabled: creating, required: true, autofocus: true, "aria-label": "Group name" })] }), _jsx(IonButton, { expand: "block", type: "submit", className: "ion-margin-top", disabled: !newGroupName.trim() || creating, children: creating ? _jsx(IonSpinner, { name: "crescent" }) : 'Create Group' })] }) })] })] })] }));
};
export default Groups;
