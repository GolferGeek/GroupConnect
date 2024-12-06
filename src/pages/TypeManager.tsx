import React, { useState } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonSegment, 
  IonSegmentButton, 
  IonLabel,
  IonIcon
} from '@ionic/react';
import { peopleOutline, gridOutline, calendarOutline } from 'ionicons/icons';
import AppHeader from '../components/AppHeader';
import TypeList from '../components/TypeList';

const TypeManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'groups' | 'activities'>('users');

  return (
    <IonPage>
      <AppHeader title="Type Manager" showBackButton />
      <IonContent>
        <IonSegment 
          value={activeTab} 
          onIonChange={e => setActiveTab(e.detail.value as 'users' | 'groups' | 'activities')}
        >
          <IonSegmentButton value="users">
            <IonIcon icon={peopleOutline} />
            <IonLabel>Users</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="groups">
            <IonIcon icon={gridOutline} />
            <IonLabel>Groups</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="activities">
            <IonIcon icon={calendarOutline} />
            <IonLabel>Activities</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {activeTab === 'users' && (
          <TypeList tableName="user_types" title="User" />
        )}
        {activeTab === 'groups' && (
          <TypeList tableName="group_types" title="Group" />
        )}
        {activeTab === 'activities' && (
          <TypeList tableName="activity_types" title="Activity" />
        )}
      </IonContent>
    </IonPage>
  );
};

export default TypeManager; 