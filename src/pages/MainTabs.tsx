import React from 'react';
import {
  IonTabs,
  IonRouterOutlet,
} from '@ionic/react';
import { Route, Redirect } from 'react-router';
import Groups from './Groups';
import Activities from './Activities';
import GroupDetails from './GroupDetails';
import ActivityDetails from './ActivityDetails';
import CreateActivity from './CreateActivity';
import EditActivity from './EditActivity';
import AppTabBar from '../components/AppTabBar';

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
        <Route>
          <Redirect to="/tabs/groups" />
        </Route>
      </IonRouterOutlet>
      <AppTabBar />
    </IonTabs>
  );
};

export default MainTabs; 