# README for UCI Student Assistant Web App

## Overview

The **UCI Student Assistant Web App** is designed to help students effectively manage their tasks, notes, and events. It integrates with Google Calendar and provides a responsive, user-friendly interface for organizing academic and personal schedules. The app includes three main sections: **Notes**, **To-Do List**, and **Calendar**.

---

## Features

### 1. **Notes Management**

- Create, view, edit, and delete notes.
- Notes display the title, content, and creation date.
- Search functionality to filter notes by title or date.

### 2. **To-Do List Management**

- Add, edit, and delete tasks.
- Mark tasks as complete or incomplete.
- Tasks can have attributes such as title, due date, and category.
- Synchronize tasks with Google Calendar events (14-day window).

### 3. **Calendar Management**

- **Interactive Calendar**:
  - Displays a monthly or weekly view.
  - Events fetched dynamically from Google Calendar.
- **Event Management**:
  - Add new events by clicking on a date.
  - View detailed information for each event, including title, date, time, location, and category.
  - Edit or delete events directly from the calendar.
- **Modals for Event Handling**:
  - Separate modals for adding/editing events and viewing event details.
  - Prevents overlapping interactions for a seamless user experience.

---

## Advanced Features

### 1. **Google Calendar API Integration**

- Dynamically fetches and synchronizes events from Google Calendar.
- Updates to events in the app reflect in the connected Google Calendar account.

### 2. **Enhanced UI/UX**

- Modals for event and task interactions.
- Clean, modern design optimized for mobile and desktop views.
- UCI branding with the official logo and colors.

### 3. **Cross-Feature Synchronization**

- Integration between Calendar and To-Do List to prevent duplicate data entry.
- Task synchronization for a 14-day window to ensure streamlined planning.

---

## File Structure

### **Backend**

- `app.py`: Main Flask application for managing API endpoints.
- `models.py`: SQLAlchemy models for tasks and notes.
- `routes.py`: Defines API routes for tasks, notes, and calendar events.
- `credentials.json`: Contains Google API credentials (required for Google Calendar integration).

### **Frontend**

- `templates/`: Contains HTML templates for the app.
  - `index.html`: Main landing page.
  - `calendar.html`: Calendar page for managing events.
- `static/`: Contains static assets such as CSS, JavaScript, and images.
  - `styles.css`: Styling for the entire application.
  - `scripts/task.js`: Manages To-Do List interactions.
  - `scripts/note.js`: Handles Note-related functionalities.
  - `scripts/calendar.js`: Controls Calendar section behavior.

---

## Technology Stack

### Frontend

- **HTML, CSS, JavaScript**: Core web technologies for UI.
- **FullCalendar.js**: Used for creating an interactive calendar.

### Backend

- **Flask**: Python-based backend framework.
- **SQLAlchemy**: ORM for database management using SQLite.
- **Google Calendar API**: Integration for event synchronization.

---


## Future Enhancements

- **Reminders**: Push notifications for upcoming tasks and events.
- **Accessibility**: Improvements for screen readers and keyboard navigation.
- **Mobile App**: Convert the web app into a mobile app using frameworks like React Native or Ionic.
- **User Authentication**: Implement OAuth2 for secure user accounts.

---

## Contributors

- **Team Members**: Yinghan Liu, Michael Xiong

For any inquiries or contributions, please contact [[yinghl6@uci.edu][myxiong@uci.edu]].

