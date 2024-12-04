import { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonSpinner,
  IonText,
  IonBadge,
  useIonToast,
} from '@ionic/react';
import { calendarOutline, peopleOutline } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { useHistory } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import AppTabBar from '../components/AppTabBar';

interface Activity {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  group: {
    id: string;
    name: string;
  };
}

const Activities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const history = useHistory();
  const [present] = useIonToast();

  useEffect(() => {
    loadActivities();
  }, [user]);

  const loadActivities = async () => {
    if (!user) return;
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

      if (error) throw error;
      setActivities(data || []);
    } catch (error: any) {
      present({
        message: 'Failed to load activities',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
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
    return (
      <IonPage>
        <AppHeader title="Activities" />
        <IonContent>
          <div className="ion-text-center ion-padding">
            <IonSpinner />
          </div>
        </IonContent>
        <AppTabBar />
      </IonPage>
    );
  }

  return (
    <IonPage>
      <AppHeader title="Activities" />
      <IonContent>
        {activities.length === 0 ? (
          <div className="ion-text-center ion-padding">
            <IonIcon
              icon={calendarOutline}
              style={{ fontSize: '64px', color: 'var(--ion-color-medium)' }}
            />
            <IonText>
              <p>No upcoming activities found.</p>
              <p>Join a group or create activities to get started!</p>
            </IonText>
          </div>
        ) : (
          <IonList>
            {activities.map(activity => (
              <IonItem
                key={activity.id}
                button
                onClick={() => history.push(`/activities/${activity.id}`)}
              >
                <IonLabel>
                  <h2>{activity.title}</h2>
                  <p>{formatDate(activity.date)}</p>
                  {activity.location && <p>{activity.location}</p>}
                </IonLabel>
                <IonBadge color="primary" slot="end">
                  {activity.group.name}
                </IonBadge>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
      <AppTabBar />
    </IonPage>
  );
};

export default Activities; 