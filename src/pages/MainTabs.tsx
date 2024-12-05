import React from 'react';
import {
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/react';
import { Route, Redirect } from 'react-router';
import { peopleOutline, calendarOutline, homeOutline, globeOutline } from 'ionicons/icons';
import Groups from './Groups';
import Activities from './Activities';
import GroupDetails from './GroupDetails';
import ActivityDetails from './ActivityDetails';
import CreateActivity from './CreateActivity';
import EditActivity from './EditActivity';
import Discover from './Discover';
import Home from './Home';

const MainTabs: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/home">
          <Home />
        </Route>
        <Route exact path="/groups">
          <Groups />
        </Route>
        <Route exact path="/groups/:id">
          <GroupDetails />
        </Route>
        <Route exact path="/discover">
          <Discover />
        </Route>
        <Route exact path="/activities">
          <Activities />
        </Route>
        <Route exact path="/activities/:id">
          <ActivityDetails />
        </Route>
        <Route exact path="/activities/:id/edit">
          <EditActivity />
        </Route>
        <Route exact path="/groups/:groupId/activities/new">
          <CreateActivity />
        </Route>
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="home" href="/home">
          <IonIcon icon={homeOutline} />
          <IonLabel>Home</IonLabel>
        </IonTabButton>
        <IonTabButton tab="groups" href="/groups">
          <IonIcon icon={peopleOutline} />
          <IonLabel>Groups</IonLabel>
        </IonTabButton>
        <IonTabButton tab="discover" href="/discover">
          <IonIcon icon={globeOutline} />
          <IonLabel>Discover</IonLabel>
        </IonTabButton>
        <IonTabButton tab="activities" href="/activities">
          <IonIcon icon={calendarOutline} />
          <IonLabel>Activities</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default MainTabs; 