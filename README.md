# MyNotesApp

MyNotesApp is a mobile note-taking application built with **React Native (Expo)** and **Firebase**.  
It allows users to create, manage, and organize notes with categories, colors, deadlines, and real-time synchronization.

## Features

### Authentication (Firebase Auth)
- Sign up with email and password
- Sign in with email and password
- Persistent login (user stays logged in after closing the app)
- Logout

### Notes (Firebase Firestore)
- Create notes (title and content are required)
- Edit notes
- Delete notes (with confirmation)
- Mark notes as completed
- Add a category to each note
- Choose a custom note color (color palette)
- Set a deadline using a date picker (past dates are not allowed)
- Real-time sync with Firestore (automatic updates)
- Notes are linked to the logged-in user (each user sees only their own notes)
- Search notes by title or content
- Filter by category
- Filter by status: All / Pending / Completed
- Sort notes by creation date (ascending/descending)

### UI / UX
- Swipe right to edit a note
- Swipe left to delete a note
- Completed notes are visually highlighted

## Tech Stack
- React Native
- Expo
- Firebase Authentication
- Firebase Firestore
- AsyncStorage (for auth persistence)


## Prerequisites
- Node.js installed
- Expo Go installed on your phone (Android/iOS)

## Steps
1. Clone the repository from GitHub:
   ```bash
   git clone https://github.com/abirouelhazi/React-my-notes-app.git
   
2. Navigate to the project directory:
  cd React-my-notes-app

3. Install dependencies:
   npm install

4. Start the application:
   npx expo start

5. Scan the QR code using the Expo Go app on your mobile device.

### Firebase Setup

This project uses Firebase for Authentication and Firestore database.
Firebase configuration is stored in firebase.js.

Firestore collection: notes
Each note includes:
title, content, category, color
deadline (optional)
completed (boolean)
createdAt
uid (user id)

### Project Structure

screens/ : app screens (Login, Signup, Home, Add/Edit Note)
assets/ : images/icons
firebase.js : Firebase configuration
App.js : main entry point

### Author
Abir Ouelhazi
