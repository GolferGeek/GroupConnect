import {
  IonContent,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonLabel,
} from '@ionic/react';
import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import TypeList from '../components/TypeList';

const TypeManager: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<'user' | 'group' | 'activity'>('user');

  return (
    <IonPage>
      <AppHeader title="Type Manager" showBackButton />
      <IonContent>
        <IonSegment value={selectedSegment} onIonChange={e => setSelectedSegment(e.detail.value as any)}>
          <IonSegmentButton value="user">
            <IonLabel>User Types</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="group">
            <IonLabel>Group Types</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="activity">
            <IonLabel>Activity Types</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {selectedSegment === 'user' && (
          <TypeList tableName="user_types" title="User" />
        )}
        {selectedSegment === 'group' && (
          <TypeList tableName="group_types" title="Group" />
        )}
        {selectedSegment === 'activity' && (
          <TypeList tableName="activity_types" title="Activity" />
        )}
      </IonContent>
    </IonPage>
  );
};

export default TypeManager; 