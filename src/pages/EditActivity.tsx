import { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  IonContent,
  IonPage,
  IonSpinner,
  useIonToast,
} from '@ionic/react';
import { supabase } from '../config/supabase';
import AppHeader from '../components/AppHeader';
import ActivityForm from '../components/ActivityForm';

interface Activity {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  url?: string;
  notes?: string;
  group_id: string;
}

const EditActivity: React.FC = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const [present] = useIonToast();

  useEffect(() => {
    loadActivity();
  }, [activityId]);

  const loadActivity = async () => {
    if (!activityId) {
      history.goBack();
      return;
    }

    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('id', activityId)
        .single();

      if (error) throw error;
      setActivity(data);
    } catch (error: any) {
      present({
        message: error.message || 'Failed to load activity',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
      history.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: Partial<Activity>) => {
    if (!activityId || !activity) return;

    console.log('Starting activity update with data:', formData);
    try {
      console.log('Sending update request to Supabase...');
      const { data, error } = await supabase
        .from('activities')
        .update(formData)
        .eq('id', activityId)
        .select()
        .single();

      console.log('Supabase update response:', { data, error });

      if (error) throw error;

      present({
        message: 'Activity updated successfully',
        duration: 2000,
        position: 'top',
        color: 'success'
      });

      console.log('Navigating back to activity details...');
      history.replace(`/groups/${activity.group_id}/activities/${activityId}`);
    } catch (error: any) {
      console.error('Error updating activity:', error);
      present({
        message: error.message || 'Failed to update activity',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    }
  };

  if (loading || !activity) {
    return (
      <IonPage>
        <AppHeader title="Edit Activity" showBackButton />
        <IonContent>
          <div className="ion-text-center ion-padding">
            <IonSpinner />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <AppHeader title="Edit Activity" showBackButton />
      <IonContent>
        <ActivityForm
          initialData={activity}
          groupId={activity.group_id}
          onSubmit={handleSubmit}
          onCancel={() => history.goBack()}
        />
      </IonContent>
    </IonPage>
  );
};

export default EditActivity; 