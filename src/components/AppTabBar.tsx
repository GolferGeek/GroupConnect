import React from 'react';
import {
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/react';
import { peopleOutline, calendarOutline, homeOutline, globeOutline } from 'ionicons/icons';
import { useLocation, useHistory } from 'react-router-dom';

const AppTabBar: React.FC = () => {
  const location = useLocation();
  const history = useHistory();

  const handleTabClick = (path: string) => {
    history.push(path);
  };

  return (
    <IonTabBar slot="bottom">
      <IonTabButton 
        tab="home" 
        onClick={() => handleTabClick('/home')}
        selected={location.pathname === '/home'}
      >
        <IonIcon icon={homeOutline} />
        <IonLabel>Home</IonLabel>
      </IonTabButton>
      <IonTabButton 
        tab="groups" 
        onClick={() => handleTabClick('/groups')}
        selected={location.pathname.startsWith('/groups')}
      >
        <IonIcon icon={peopleOutline} />
        <IonLabel>Groups</IonLabel>
      </IonTabButton>
      <IonTabButton 
        tab="discover" 
        onClick={() => handleTabClick('/discover')}
        selected={location.pathname === '/discover'}
      >
        <IonIcon icon={globeOutline} />
        <IonLabel>Discover</IonLabel>
      </IonTabButton>
      <IonTabButton 
        tab="activities" 
        onClick={() => handleTabClick('/activities')}
        selected={location.pathname.startsWith('/activities')}
      >
        <IonIcon icon={calendarOutline} />
        <IonLabel>Activities</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
};

export default AppTabBar; 