import { useHistory, useParams } from 'react-router-dom';
import {
  IonContent,
  IonPage,
  useIonToast,
} from '@ionic/react';
import { supabase } from '../config/supabase';
import AppHeader from '../components/AppHeader';
import ActivityForm from '../components/ActivityForm';

interface CreateActivityParams {
  groupId?: string;
}

const CreateActivity: React.FC = () => {
  const history = useHistory();
  const { groupId } = useParams<CreateActivityParams>();
  const [present] = useIonToast();

  const handleSubmit = async (formData: any) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      present({
        message: 'Activity created successfully',
        duration: 2000,
        position: 'top',
        color: 'success'
      });

      // Navigate back to the group if we came from there
      if (groupId) {
        history.replace(`/groups/${groupId}`);
      } else {
        history.replace(`/activities/${data.id}`);
      }
    } catch (error: any) {
      present({
        message: error.message || 'Failed to create activity',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
      throw error;
    }
  };

  return (
    <IonPage>
      <AppHeader title="Create Activity" showBackButton />
      <IonContent>
        <ActivityForm
          groupId={groupId}
          onSubmit={handleSubmit}
          onCancel={() => history.goBack()}
        />
      </IonContent>
    </IonPage>
  );
};

export default CreateActivity; 