import { useState, useEffect } from 'react';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonBackButton,
  useIonToast,
  IonText,
} from '@ionic/react';
import { logOutOutline } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, UserProfile } from '../services/database';
import { useHistory } from 'react-router-dom';

interface AppHeaderProps {
  title: string;
  showBackButton?: boolean;
  actions?: Array<{
    icon: string;
    handler: () => void;
  }>;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, showBackButton = false, actions }) => {
  const { user, session, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const history = useHistory();
  const [present] = useIonToast();

  useEffect(() => {
    if (user && session) {
      getUserProfile(user.id)
        .then(setProfile)
        .catch(error => {
          present({
            message: 'Failed to load profile',
            duration: 3000,
            position: 'top',
            color: 'danger'
          });
        });
    }
  }, [user, session]);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error: any) {
      present({
        message: error.message || 'Failed to sign out',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    }
  };

  return (
    <IonHeader>
      <IonToolbar>
        {showBackButton && (
          <IonButtons slot="start">
            <IonBackButton defaultHref="/groups" />
          </IonButtons>
        )}
        <IonTitle>{title}</IonTitle>
        {session && (
          <IonButtons slot="end">
            <IonText color="medium" className="ion-padding-end">
              {profile?.username || 'User'}
            </IonText>
            <IonButton onClick={handleSignOut}>
              <IonIcon slot="icon-only" icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        )}
      </IonToolbar>
    </IonHeader>
  );
};

export default AppHeader; 