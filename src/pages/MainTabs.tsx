import React from 'react';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
} from '@ionic/react';
import { Route, Redirect } from 'react-router';
import { peopleOutline, calendarOutline } from 'ionicons/icons';
import Groups from './Groups';
import Activities from './Activities';
import GroupDetails from './GroupDetails';
import ActivityDetails from './ActivityDetails';
import CreateActivity from './CreateActivity';
import EditActivity from './EditActivity';

const MainTabs: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/tabs/groups">
          <Groups />
        </Route>
        <Route exact path="/tabs/activities">
          <Activities />
        </Route>
        <Route exact path="/tabs/groups/:groupId">
          <GroupDetails />
        </Route>
        <Route exact path="/tabs/activities/new">
          <CreateActivity />
        </Route>
        <Route exact path="/tabs/groups/:groupId/activities/new">
          <CreateActivity />
        </Route>
        <Route exact path="/tabs/activities/:activityId">
          <ActivityDetails />
        </Route>
        <Route exact path="/tabs/activities/:activityId/edit">
          <EditActivity />
        </Route>
        <Route exact path="/tabs">
          <Redirect to="/tabs/groups" />
        </Route>
      </IonRouterOutlet>

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
    </IonTabs>
  );
};

export default MainTabs; 