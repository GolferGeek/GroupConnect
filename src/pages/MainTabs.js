import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet, } from '@ionic/react';
import { Route, Redirect } from 'react-router';
import { peopleOutline, calendarOutline } from 'ionicons/icons';
import Groups from './Groups';
import Activities from './Activities';
import GroupDetails from './GroupDetails';
import ActivityDetails from './ActivityDetails';
import CreateActivity from './CreateActivity';
import EditActivity from './EditActivity';
const MainTabs = () => {
    return (_jsxs(IonTabs, { children: [_jsxs(IonRouterOutlet, { children: [_jsx(Route, { exact: true, path: "/tabs/groups", children: _jsx(Groups, {}) }), _jsx(Route, { exact: true, path: "/tabs/activities", children: _jsx(Activities, {}) }), _jsx(Route, { exact: true, path: "/tabs/groups/:groupId", children: _jsx(GroupDetails, {}) }), _jsx(Route, { exact: true, path: "/tabs/activities/new", children: _jsx(CreateActivity, {}) }), _jsx(Route, { exact: true, path: "/tabs/groups/:groupId/activities/new", children: _jsx(CreateActivity, {}) }), _jsx(Route, { exact: true, path: "/tabs/activities/:activityId", children: _jsx(ActivityDetails, {}) }), _jsx(Route, { exact: true, path: "/tabs/activities/:activityId/edit", children: _jsx(EditActivity, {}) }), _jsx(Route, { exact: true, path: "/tabs", children: _jsx(Redirect, { to: "/tabs/groups" }) })] }), _jsxs(IonTabBar, { slot: "bottom", children: [_jsxs(IonTabButton, { tab: "groups", href: "/tabs/groups", children: [_jsx(IonIcon, { icon: peopleOutline }), _jsx(IonLabel, { children: "Groups" })] }), _jsxs(IonTabButton, { tab: "activities", href: "/tabs/activities", children: [_jsx(IonIcon, { icon: calendarOutline }), _jsx(IonLabel, { children: "Activities" })] })] })] }));
};
export default MainTabs;
