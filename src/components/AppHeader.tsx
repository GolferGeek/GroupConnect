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
  IonLabel,
} from '@ionic/react';
import { logOutOutline, personCircleOutline } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, UserProfile } from '../services/database';
import { useHistory } from 'react-router-dom';

interface AppHeaderProps {
  title: string;
  showBackButton?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, showBackButton }) => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [present] = useIonToast();
  const history = useHistory();

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

  const handleSignOut = async () => {
    try {
      console.log('1. Starting signOut process');
      await signOut();
      console.log('2. Sign out successful');
    } catch (error) {
      console.error('Error signing out:', error);
      present({
        message: 'Failed to sign out',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
    }
  };

  return (
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          {showBackButton ? (
            <>
              <IonBackButton defaultHref="/groups" />
              {/* Title commented out to save space
              <IonTitle style={{ paddingLeft: 0 }}>{title}</IonTitle>
              */}
            </>
          ) : (
            <IonButton onClick={() => history.push('/groups')} fill="clear" color="primary">
              {/* GroupConnect text commented out to save space
              <strong className="ion-hide-breakpoint-down-sm">GroupConnect</strong>
              */}
            </IonButton>
          )}
        </IonButtons>
        {/* Main title commented out to save space
        {!showBackButton && <IonTitle>{title}</IonTitle>}
        */}
        <IonButtons slot="end">
          {profile && (
            <>
              <IonButton onClick={() => history.push('/profile')}>
                <IonIcon slot="icon-only" icon={personCircleOutline} />
              </IonButton>
              <IonText color="medium" className="ion-padding-end">
                {profile.username}
              </IonText>
            </>
          )}
          <IonButton onClick={handleSignOut}>
            <IonIcon slot="icon-only" icon={logOutOutline} />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default AppHeader; 