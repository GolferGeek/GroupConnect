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

  const getSelectedTab = () => {
    const path = location.pathname;
    if (path.startsWith('/groups')) return 'groups';
    if (path.startsWith('/activities')) return 'activities';
    if (path.startsWith('/discover')) return 'discover';
    if (path.startsWith('/home')) return 'home';
    return '';
  };

  return (
    <IonTabBar slot="bottom">
      <IonTabButton 
        tab="home" 
        onClick={() => history.push('/home')}
        selected={getSelectedTab() === 'home'}
      >
        <IonIcon icon={homeOutline} />
        <IonLabel>Home</IonLabel>
      </IonTabButton>
      <IonTabButton 
        tab="groups" 
        onClick={() => history.push('/groups')}
        selected={getSelectedTab() === 'groups'}
      >
        <IonIcon icon={peopleOutline} />
        <IonLabel>Groups</IonLabel>
      </IonTabButton>
      <IonTabButton 
        tab="discover" 
        onClick={() => history.push('/discover')}
        selected={getSelectedTab() === 'discover'}
      >
        <IonIcon icon={globeOutline} />
        <IonLabel>Discover</IonLabel>
      </IonTabButton>
      <IonTabButton 
        tab="activities" 
        onClick={() => history.push('/activities')}
        selected={getSelectedTab() === 'activities'}
      >
        <IonIcon icon={calendarOutline} />
        <IonLabel>Activities</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
};

export default AppTabBar; 