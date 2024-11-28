from flask import Flask, render_template, session, redirect, url_for, request, jsonify
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
import os

# Initialize the Flask app
app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Replace with a secure key

# Google OAuth credentials and scope
GOOGLE_CREDENTIALS_JSON = "credentials.json"
SCOPES = ['https://www.googleapis.com/auth/calendar']

# Allow insecure HTTP connections during development
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

# Initialize the Google OAuth Flow
flow = Flow.from_client_secrets_file(
    GOOGLE_CREDENTIALS_JSON,
    scopes=SCOPES,
    redirect_uri='http://localhost:8000/oauth2callback'
)

# Home route
@app.route('/')
def index():
    return render_template('index.html')

# Authorization route for Google OAuth
@app.route('/authorize')
def authorize():
    # Generate the authorization URL and save the state for CSRF protection
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    session['state'] = state
    return redirect(authorization_url)

# OAuth callback route
@app.route('/oauth2callback')
def oauth2callback():
    # Exchange the authorization code for tokens
    flow.fetch_token(authorization_response=request.url)
    credentials = flow.credentials
    session['credentials'] = credentials_to_dict(credentials)
    return redirect(url_for('calendar'))

# Calendar page route
@app.route('/calendar')
def calendar():
    return render_template('calendar.html')

# API route for fetching Google Calendar events
@app.route('/api/calendar-events')
def calendar_events_api():
    if 'credentials' not in session:
        return jsonify({'error': 'User not authorized'}), 403

    credentials = Credentials(**session['credentials'])
    service = build('calendar', 'v3', credentials=credentials)

    try:
        # Fetch events from Google Calendar
        events_result = service.events().list(
            calendarId='primary',
            maxResults=50,
            singleEvents=True,
            orderBy='startTime'
        ).execute()

        events = events_result.get('items', [])
        calendar_events = []

        # Convert Google Calendar events to a format compatible with FullCalendar
        for event in events:
            start = event['start'].get('dateTime', event['start'].get('date'))
            end = event['end'].get('dateTime', event['end'].get('date'))
            calendar_events.append({
                'title': event.get('summary', 'No Title'),
                'start': start,
                'end': end,
            })

        return jsonify(calendar_events)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# To-Do list route
@app.route('/todo', methods=['GET', 'POST'])
def todo():
    if request.method == 'POST':
        task = request.form.get('task')
        due_date = request.form.get('due_date')
        if 'tasks' not in session:
            session['tasks'] = []
        session['tasks'].append({'task': task, 'due_date': due_date})
    tasks = session.get('tasks', [])
    return render_template('todo.html', tasks=tasks)

# Notes functionality route
@app.route('/notes', methods=['GET', 'POST'])
def notes():
    if request.method == 'POST':
        title = request.form.get('title')
        content = request.form.get('content')
        if 'notes' not in session:
            session['notes'] = []
        session['notes'].append({'title': title, 'content': content})
    notes = session.get('notes', [])
    return render_template('notes.html', notes=notes)

# Convert credentials to a dictionary format
def credentials_to_dict(credentials):
    return {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'scopes': credentials.scopes
    }

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
