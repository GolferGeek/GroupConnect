import { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonButton,
  IonIcon,
  IonSpinner,
  IonText,
  IonItem,
  IonLabel,
  IonBadge,
  useIonToast,
  useIonActionSheet,
} from '@ionic/react';
import {
  locationOutline,
  timeOutline,
  linkOutline,
  createOutline,
  trashOutline,
  peopleOutline,
  ellipsisHorizontal,
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import AppHeader from '../components/AppHeader';
import MarkdownViewer from '../components/MarkdownViewer';

interface Activity {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  url?: string;
  notes?: string;
  group_id: string;
  group: {
    name: string;
  };
}

const ActivityDetails: React.FC = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const [activity, setActivity] = useState<Activity | null>(null);
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
    if (!activityId || !user) return;
    try {
      // Get activity details
      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .select('*, group:groups(name)')
        .eq('id', activityId)
        .single();

      if (activityError) throw activityError;
      setActivity(activityData);

      // Check if user is admin of the group
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', activityData.group_id)
        .eq('user_id', user.id)
        .single();

      if (memberError) throw memberError;
      setIsAdmin(memberData.role === 'admin');

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

  const handleOptions = () => {
    if (!isAdmin) return;

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

      if (error) throw error;
      
      present({
        message: 'Activity deleted successfully',
        duration: 2000,
        position: 'top',
        color: 'success'
      });

      // Navigate back to the group if we have group_id
      if (activity?.group_id) {
        history.replace(`/tabs/groups/${activity.group_id}`);
      } else {
        history.replace('/tabs/activities');
      }
    } catch (error: any) {
      present({
        message: error.message || 'Failed to delete activity',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    }
  };

  const formatDate = (dateString: string) => {
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
    return (
      <IonPage>
        <AppHeader title="Activity" showBackButton />
        <IonContent>
          <div className="ion-text-center ion-padding">
            <IonSpinner />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!activity) return null;

  return (
    <IonPage>
      <AppHeader 
        title={activity.title} 
        showBackButton
        actions={
          isAdmin ? [
            {
              icon: ellipsisHorizontal,
              handler: handleOptions
            }
          ] : undefined
        }
      />
      
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>{activity.title}</IonCardTitle>
            <IonCardSubtitle>
              <IonBadge color="primary" className="ion-margin-end">
                {activity.group.name}
              </IonBadge>
            </IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem lines="none">
              <IonIcon icon={timeOutline} slot="start" />
              <IonLabel>{formatDate(activity.date)}</IonLabel>
            </IonItem>

            {activity.location && (
              <IonItem lines="none">
                <IonIcon icon={locationOutline} slot="start" />
                <IonLabel>{activity.location}</IonLabel>
              </IonItem>
            )}

            {activity.url && (
              <IonItem lines="none" href={activity.url} target="_blank">
                <IonIcon icon={linkOutline} slot="start" />
                <IonLabel>Meeting Link</IonLabel>
              </IonItem>
            )}
          </IonCardContent>
        </IonCard>

        {activity.description && (
          <div className="ion-margin-top">
            <MarkdownViewer content={activity.description} />
          </div>
        )}

        {activity.notes && (
          <IonCard className="ion-margin-top">
            <IonCardHeader>
              <IonCardTitle>Notes</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <MarkdownViewer content={activity.notes} />
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ActivityDetails; 