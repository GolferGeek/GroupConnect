import React, { useState, useEffect } from 'react';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonBackButton,
  IonText,
  useIonToast,
} from '@ionic/react';
import { logOutOutline } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, UserProfile } from '../services/database';

interface AppHeaderProps {
  title: string;
  showBackButton?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, showBackButton }) => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [present] = useIonToast();

  useEffect(() => {
    if (user) {
      getUserProfile(user.id)
        .then(userProfile => {
          setProfile(userProfile);
        })
        .catch(error => {
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
    <IonHeader>
      <IonToolbar>
        {showBackButton && (
          <IonButtons slot="start">
            <IonBackButton defaultHref="/groups" />
          </IonButtons>
        )}
        <IonTitle>{title}</IonTitle>
        <IonButtons slot="end">
          {profile && (
            <IonText color="medium" className="ion-padding-end">
              {profile.username}
            </IonText>
          )}
          <IonButton onClick={signOut}>
            <IonIcon slot="icon-only" icon={logOutOutline} />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default AppHeader; 