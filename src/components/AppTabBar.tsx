import React from 'react';
import {
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/react';
import { peopleOutline, calendarOutline } from 'ionicons/icons';

const AppTabBar: React.FC = () => {
  return (
    <IonTabBar slot="bottom">
      <IonTabButton tab="groups" href="/tabs/groups">
        <IonIcon icon={peopleOutline} />
        <IonLabel>Groups</IonLabel>
      </IonTabButton>
      <IonTabButton tab="activities" href="/tabs/activities">
        <IonIcon icon={calendarOutline} />
        <IonLabel>Activities</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
};

export default AppTabBar; 