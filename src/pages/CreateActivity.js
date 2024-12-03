import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useHistory, useParams } from 'react-router-dom';
import { IonContent, IonPage, useIonToast, } from '@ionic/react';
import { supabase } from '../config/supabase';
import AppHeader from '../components/AppHeader';
import ActivityForm from '../components/ActivityForm';
const CreateActivity = () => {
    const history = useHistory();
    const { groupId } = useParams();
    const [present] = useIonToast();
    const handleSubmit = async (formData) => {
        try {
            const { data, error } = await supabase
                .from('activities')
                .insert([formData])
                .select()
                .single();
            if (error)
                throw error;
            present({
                message: 'Activity created successfully',
                duration: 2000,
                position: 'top',
                color: 'success'
            });
            // Navigate back to the group if we came from there
            if (groupId) {
                history.replace(`/groups/${groupId}`);
            }
            else {
                history.replace(`/activities/${data.id}`);
            }
        }
        catch (error) {
            present({
                message: error.message || 'Failed to create activity',
                duration: 3000,
                position: 'top',
                color: 'danger'
            });
            throw error;
        }
    };
    return (_jsxs(IonPage, { children: [_jsx(AppHeader, { title: "Create Activity", showBackButton: true }), _jsx(IonContent, { children: _jsx(ActivityForm, { groupId: groupId, onSubmit: handleSubmit, onCancel: () => history.goBack() }) })] }));
};
export default CreateActivity;
