import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { IonContent, IonPage, IonSpinner, useIonToast, } from '@ionic/react';
import { supabase } from '../config/supabase';
import AppHeader from '../components/AppHeader';
import ActivityForm from '../components/ActivityForm';
const EditActivity = () => {
    const { activityId } = useParams();
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const history = useHistory();
    const [present] = useIonToast();
    useEffect(() => {
        loadActivity();
    }, [activityId]);
    const loadActivity = async () => {
        try {
            const { data, error } = await supabase
                .from('activities')
                .select('*')
                .eq('id', activityId)
                .single();
            if (error)
                throw error;
            setActivity(data);
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
    const handleSubmit = async (formData) => {
        try {
            const { error } = await supabase
                .from('activities')
                .update(formData)
                .eq('id', activityId)
                .select()
                .single();
            if (error)
                throw error;
            present({
                message: 'Activity updated successfully',
                duration: 2000,
                position: 'top',
                color: 'success'
            });
            history.replace(`/activities/${activityId}`);
        }
        catch (error) {
            present({
                message: error.message || 'Failed to update activity',
                duration: 3000,
                position: 'top',
                color: 'danger'
            });
            throw error;
        }
    };
    if (loading) {
        return (_jsxs(IonPage, { children: [_jsx(AppHeader, { title: "Edit Activity", showBackButton: true }), _jsx(IonContent, { children: _jsx("div", { className: "ion-text-center ion-padding", children: _jsx(IonSpinner, {}) }) })] }));
    }
    return (_jsxs(IonPage, { children: [_jsx(AppHeader, { title: "Edit Activity", showBackButton: true }), _jsx(IonContent, { children: _jsx(ActivityForm, { initialData: activity, groupId: activity.group_id, onSubmit: handleSubmit, onCancel: () => history.goBack() }) })] }));
};
export default EditActivity;
