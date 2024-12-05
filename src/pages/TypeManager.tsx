import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import AppHeader from '../components/AppHeader';
import TypeList from '../components/TypeList';

const TypeManager: React.FC = () => {
  return (
    <IonPage>
      <AppHeader title="Type Manager" showBackButton />
      <IonContent>
        <TypeList tableName="user_types" title="User" />
        <TypeList tableName="group_types" title="Group" />
        <TypeList tableName="activity_types" title="Activity" />
      </IonContent>
    </IonPage>
  );
};

export default TypeManager; 