import { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonIcon,
  IonText,
  useIonToast,
} from '@ionic/react';
import { personCircleOutline } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, UserProfile } from '../services/database';
import AppHeader from '../components/AppHeader';
import './Home.css';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [present] = useIonToast();

  useEffect(() => {
    console.log('Home page mounted, user:', user);
    if (user) {
      getUserProfile(user.id)
        .then(userProfile => {
          console.log('Loaded user profile:', userProfile);
          setProfile(userProfile);
        })
        .catch(error => {
          console.error('Failed to load profile:', error);
          present({
            message: 'Failed to load profile',
            duration: 3000,
            position: 'top',
            color: 'danger'
          });
        });
    }
  }, [user]);

  return (
    <IonPage>
      <AppHeader title="GroupConnect" />
      <IonContent className="ion-padding">
        <div className="ion-text-center ion-padding">
          <IonIcon
            icon={personCircleOutline}
            style={{ fontSize: '64px', color: 'var(--ion-color-medium)' }}
          />
          <IonText>
            <h2>Welcome, {profile?.username || 'User'}!</h2>
            <p>{profile?.email}</p>
          </IonText>
        </div>

        <div className="ion-padding">
          <p className="ion-text-center">
            Start by creating a group or joining one through an invitation.
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
