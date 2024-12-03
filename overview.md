# Overview

## 1. Introduction
GroupConnect is a very simple and easy-to-use tool for creating and managing groups of people and their shared activities.

It is for people that only want to share activities with a small group of people.  It is not for large groups of people or for businesses.
Imagine you are a parent with a small group of friends that you want to share activities with.  You can create a group for your group of friends and then add activities to the group.  Your friends can then see the activities and add them to their calendars.
Older people that are not tech-savvy might also find this useful.
Our users don't often have lots of groups and they don't often have lots of activities in their groups.

Users can create an account and then create a group.  They can then add activities to the group.  Users can also be added to groups by other users-- through email invitations sent from the GroupConnect system (from one user to another).

Some groups will have a single recurring activity.  Other groups will have just a few activities that recur on different schedules.  It is possible to have a non-recurring activity in a group.

Activities have a title, a description, a location, and a date/time, and a notes section.  They can also have a URL (for Zoom meetings, etc.).

Typical activities might include:
- A weekly meeting of a book club
- A monthly pot-luck dinner
- multiple, ongoing training sessions for runners, triathletes, etc.
- lunch meetups with friends

Most importantly, the activities should be private.  Only the users in the group should be able to see the activities.  And be the most simple and easy-to-use system for doing so.

## 2. Technical Overview
This is an Ionic/React app that uses Firebase for the backend.  

We will use the Firebase Authentication system for login.  We will use the Firebase Firestore Database for the backend database.  We will use the Firebase Storage for file uploads (like group photos).  We will be hosting the app on Firebase Hosting.

We will use the Capacitor library to package the app for the different app stores.  We want to be able to run the app natively on iOS and Android devices. This includes using the device's calendar and notifications system.  We will also be able to run the app in a web browser, but we don't need to worry about browser notifications.  We want the user to be able to authenticate using their Google account and their phone's built-in authentication system-- like Face ID or Touch ID on iOS and Android devices.

## 3. Models

### 3.1. User
Id: string
Username: string
Email: string
Name: string
PhotoUrl: string
Groups: string[]

### 3.2. Group
Id: string
Name: string
PhotoUrl: string
Members: string[]
Activities: Activity[]

### 3.3. Activity
Id: string
Title: string
Description: string
Recurrence: string
Location: string
Date: Date
Notes: string
URL: string

## 4. High-Level Project Plan

### 4.1. Week 1
- Set up the project
- Create the React app
- Create the Ionic app
- Create the Firebase backend
- Create the Capacitor configuration
- Create the authentication system
- Create the user model in the Firestore database
- Create the group model in the Firestore database
- Create the activity model in the Firestore database
- User can sign in
- User can sign up
- User can sign out
- User can create a group
- User can edit a group
- User can delete a group
- User can add an activity to a group
- User can edit an activity in a group
- User can delete an activity from a group
- User can add themselves to a group
- User can remove themselves from a group
- User can send an email invitation to another user to join a group (and also sign up to the app)
- User can simply add another user to a group (this would require a search function to find the user by email or username)
- Deploy the app to Firebase Hosting
- Deploy to local iOS device


