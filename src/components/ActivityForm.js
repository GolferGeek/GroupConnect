import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { IonList, IonItem, IonLabel, IonInput, IonTextarea, IonButton, IonDatetime, IonSpinner, IonSelect, IonSelectOption, useIonToast, } from '@ionic/react';
import { supabase } from '../config/supabase';
const ActivityForm = ({ initialData, groupId, onSubmit, onCancel, }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: new Date().toISOString(),
        location: '',
        url: '',
        notes: '',
        group_id: groupId || '',
        ...initialData,
    });
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingGroups, setLoadingGroups] = useState(!groupId);
    const [present] = useIonToast();
    useEffect(() => {
        if (!groupId) {
            loadGroups();
        }
    }, [groupId]);
    const loadGroups = async () => {
        try {
            const { data, error } = await supabase
                .from('groups')
                .select('id, name')
                .order('name');
            if (error)
                throw error;
            setGroups(data || []);
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
            setLoadingGroups(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
        }
        finally {
            setLoading(false);
        }
    };
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    if (loadingGroups) {
        return (_jsx("div", { className: "ion-text-center ion-padding", children: _jsx(IonSpinner, {}) }));
    }
    return (_jsxs("form", { onSubmit: handleSubmit, children: [_jsxs(IonList, { children: [_jsxs(IonItem, { children: [_jsx(IonLabel, { position: "stacked", children: "Title *" }), _jsx(IonInput, { value: formData.title, onIonChange: e => handleChange('title', e.detail.value), required: true, placeholder: "Enter activity title" })] }), !groupId && (_jsxs(IonItem, { children: [_jsx(IonLabel, { position: "stacked", children: "Group *" }), _jsx(IonSelect, { value: formData.group_id, onIonChange: e => handleChange('group_id', e.detail.value), placeholder: "Select group", required: true, children: groups.map(group => (_jsx(IonSelectOption, { value: group.id, children: group.name }, group.id))) })] })), _jsxs(IonItem, { children: [_jsx(IonLabel, { position: "stacked", children: "Date and Time *" }), _jsx(IonDatetime, { value: formData.date, onIonChange: e => handleChange('date', e.detail.value), min: new Date().toISOString() })] }), _jsxs(IonItem, { children: [_jsx(IonLabel, { position: "stacked", children: "Location" }), _jsx(IonInput, { value: formData.location, onIonChange: e => handleChange('location', e.detail.value), placeholder: "Enter location" })] }), _jsxs(IonItem, { children: [_jsx(IonLabel, { position: "stacked", children: "URL" }), _jsx(IonInput, { value: formData.url, onIonChange: e => handleChange('url', e.detail.value), type: "url", placeholder: "Enter meeting link" })] }), _jsxs(IonItem, { children: [_jsx(IonLabel, { position: "stacked", children: "Description" }), _jsx(IonTextarea, { value: formData.description, onIonChange: e => handleChange('description', e.detail.value), rows: 4, placeholder: "Enter description (markdown supported)" })] }), _jsxs(IonItem, { children: [_jsx(IonLabel, { position: "stacked", children: "Notes" }), _jsx(IonTextarea, { value: formData.notes, onIonChange: e => handleChange('notes', e.detail.value), rows: 4, placeholder: "Enter additional notes (markdown supported)" })] })] }), _jsxs("div", { className: "ion-padding", children: [_jsx(IonButton, { expand: "block", type: "submit", disabled: loading, children: loading ? _jsx(IonSpinner, { name: "crescent" }) : 'Save Activity' }), _jsx(IonButton, { expand: "block", color: "medium", onClick: onCancel, disabled: loading, children: "Cancel" })] })] }));
};
export default ActivityForm;
