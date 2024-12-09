from flask import Flask, session, redirect, url_for, request, jsonify, render_template
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from flask_sqlalchemy import SQLAlchemy
import secrets
import os

app = Flask(__name__)
app.secret_key = secrets.token_hex(32)  # Generates a 64-character hexadecimal key

# Google Calendar Configuration
GOOGLE_CREDENTIALS_JSON = "credentials.json"
SCOPES = ['https://www.googleapis.com/auth/calendar']

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

flow = Flow.from_client_secrets_file(
    GOOGLE_CREDENTIALS_JSON,
    scopes=SCOPES,
    redirect_uri='http://localhost:8000/oauth2callback'
)

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'  # Using SQLite database
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Data Models
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    due_date = db.Column(db.String(50))
    category = db.Column(db.String(50))
    completed = db.Column(db.Boolean, default=False)

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    date_created = db.Column(db.DateTime, default=db.func.current_timestamp())

# Initialize Database
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/authorize')
def authorize():
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    session['state'] = state
    return redirect(authorization_url)

@app.route('/oauth2callback')
def oauth2callback():
    try:
        flow.fetch_token(authorization_response=request.url)
        credentials = flow.credentials
        session['credentials'] = credentials_to_dict(credentials)
        return redirect(url_for('calendar'))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/calendar')
def calendar():
    if 'credentials' not in session:
        return redirect(url_for('index'))
    return render_template('calendar.html')

### Calendar Events APIs ###
@app.route('/api/events', methods=['GET'])
def get_events():
    if 'credentials' not in session:
        return jsonify({'error': 'Not authorized'}), 403

    credentials = Credentials(**session['credentials'])
    service = build('calendar', 'v3', credentials=credentials)

    try:
        events_result = service.events().list(
            calendarId='primary',
            singleEvents=True,
            orderBy='startTime'
        ).execute()

        events = [
            {
                'id': event['id'],
                'title': event.get('summary', 'No Title'),
                'start': event['start'].get('dateTime', event['start'].get('date')),
                'end': event['end'].get('dateTime', event['end'].get('date')),
                'location': event.get('location', ''),
                'category': event.get('colorId', 'default')
            }
            for event in events_result.get('items', [])
        ]
        return jsonify(events)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/events', methods=['POST'])
def add_event():
    if 'credentials' not in session:
        return jsonify({'error': 'Not authorized'}), 403

    credentials = Credentials(**session['credentials'])
    service = build('calendar', 'v3', credentials=credentials)

    try:
        data = request.json
        event = {
            'summary': data['title'],
            'start': {
                'dateTime': f"{data['date']}T{data['time']}:00",
                'timeZone': 'America/Los_Angeles',
            },
            'end': {
                'dateTime': f"{data['date']}T{data['time']}:00",
                'timeZone': 'America/Los_Angeles',
            },
            'colorId': get_color_id(data.get('category', 'default')),
        }
        created_event = service.events().insert(calendarId='primary', body=event).execute()
        return jsonify(created_event)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/events/<event_id>', methods=['PUT'])
def update_event(event_id):
    if 'credentials' not in session:
        return jsonify({'error': 'Not authorized'}), 403

    credentials = Credentials(**session['credentials'])
    service = build('calendar', 'v3', credentials=credentials)

    try:
        data = request.json
        event = {
            'summary': data['title'],
            'start': {'dateTime': f"{data['date']}T{data['time']}:00", 'timeZone': 'America/Los_Angeles'},
            'end': {'dateTime': f"{data['date']}T{data['time']}:00", 'timeZone': 'America/Los_Angeles'},
        }
        updated_event = service.events().update(calendarId='primary', eventId=event_id, body=event).execute()
        return jsonify(updated_event)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/events/<event_id>', methods=['DELETE'])
def delete_event(event_id):
    if 'credentials' not in session:
        return jsonify({'error': 'Not authorized'}), 403

    credentials = Credentials(**session['credentials'])
    service = build('calendar', 'v3', credentials=credentials)

    try:
        service.events().delete(calendarId='primary', eventId=event_id).execute()
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

### Tasks APIs ###
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    return jsonify([
        {
            'id': task.id,
            'title': task.title,
            'due_date': task.due_date,
            'category': task.category,
            'completed': task.completed
        }
        for task in tasks
    ])

@app.route('/api/tasks', methods=['POST'])
def create_task():
    try:
        data = request.json
        print('Received Data:', data)  # 调试信息

        task = Task(
            title=data['title'],
            due_date=data.get('due_date'),  # 确保接受并存储 due_date
            category=data.get('category'),
            completed=data.get('completed', False)
        )
        db.session.add(task)
        db.session.commit()
        return jsonify({
            'id': task.id,
            'title': task.title,
            'due_date': task.due_date,  # 返回保存的 due_date
            'category': task.category,
            'completed': task.completed,
        }), 201
    except KeyError as e:
        return jsonify({'error': f'Missing key: {e}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500




@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({'error': 'Task not found'}), 404

        data = request.json

        # Validate and format due_date
        due_date = data.get('due_date')
        if due_date:
            try:
                from dateutil.parser import parse
                due_date = parse(due_date).isoformat()
            except ValueError:
                return jsonify({'error': 'Invalid due_date format'}), 400
        else:
            due_date = None

        # Update task attributes
        task.title = data['title']
        task.due_date = due_date
        task.category = data.get('category', task.category)
        task.completed = data.get('completed', task.completed)

        db.session.commit()

        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({'error': 'Task not found'}), 404

        db.session.delete(task)
        db.session.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

### Notes APIs ###
@app.route('/api/notes', methods=['GET'])
def get_notes():
    notes = Note.query.all()
    return jsonify([
        {
            'id': note.id,
            'title': note.title,
            'content': note.content,
            'date_created': note.date_created.strftime('%Y-%m-%d')
        }
        for note in notes
    ])

@app.route('/api/notes', methods=['POST'])
def create_note():
    try:
        data = request.json
        note = Note(
            title=data['title'],
            content=data['content']
        )
        db.session.add(note)
        db.session.commit()
        return jsonify({'id': note.id, 'title': note.title}), 201
    except KeyError as e:
        return jsonify({'error': f'Missing key: {e}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/notes/<int:note_id>', methods=['PUT'])
def update_note(note_id):
    try:
        note = Note.query.get(note_id)
        if not note:
            return jsonify({'error': 'Note not found'}), 404

        data = request.json
        note.title = data['title']
        note.content = data['content']
        db.session.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    try:
        note = Note.query.get(note_id)
        if not note:
            return jsonify({'error': 'Note not found'}), 404

        db.session.delete(note)
        db.session.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

### Helper Functions ###
def get_color_id(category):
    color_map = {'exam': '1', 'class': '2', 'personal': '3'}
    return color_map.get(category, '0')

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
