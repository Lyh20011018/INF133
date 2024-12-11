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
- **Reminders**:
  - Notifications appear 30 minutes before a scheduled event.
  - Reminders are customizable and sent via browser notifications or in-app pop-ups.
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

### 4. **Reminders**

  - Notifications appear 30 minutes before a scheduled event.
  - Reminders are customizable and sent via browser notifications or in-app pop-ups.

---

## File Structure

## File Structure

**Project Directory Structure**

instance/
    app.db                # SQLite database file
static/
    css/
        styles.css        # Main stylesheet
    js/
        calendar.js       # Calendar functionalities
        notes.js          # Notes functionalities
        todo.js           # To-Do functionalities
templates/
    index.html            # Main HTML template
README.md                 # Project README file
app.py                    # Flask application
credentials.json          # Google API credentials file
requirements.txt          # Python dependencies

---

## Setup Instructions

### Prerequisites

1. **Python 3.8 or higher**: Make sure Python is installed on your system.
2. **Google Cloud Credentials**: Required for Google Calendar API integration.

### Steps to Set Up and Run Locally

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Lyh20011018/INF133.git
   cd INF133

2. **Set up a virtual environment**:

   ```bash
   python -m venv env
   source env/bin/activate  # On Windows: env\Scripts\activate


3. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   
4. **Seup up the database**:

- Ensure that the app.db file exists in the instance directory. If not, you can initialize it:
   
   ```bash
   flask db init
   flask db migrate
   flask db upgrade

6. **Add Google API credentials**:

- Obtain the credentials.json file from your Google Cloud Console.
- Place the credentials.json file in the root directory of your project.
- Use existed credentials is fine, I added INF133 teaching team in test user.

6. **Run the application**:

   ```bash
   flask run

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

