from flask import Flask, redirect, url_for, session, request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
import os

# Flask app setup
app = Flask(__name__)
app.secret_key = 'your_secret_key'  # 替换为更复杂的密钥
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'  # 允许不安全的 HTTP（仅用于开发环境）

# Google OAuth credentials
GOOGLE_CREDENTIALS_JSON = "credentials.json"  # 确保这个文件在项目根目录

SCOPES = ['https://www.googleapis.com/auth/calendar']

# OAuth 2.0 Flow setup
flow = Flow.from_client_secrets_file(
    GOOGLE_CREDENTIALS_JSON,
    scopes=SCOPES,
    redirect_uri='http://localhost:8000/oauth2callback'  # 确保与 credentials.json 的 redirect_uris 匹配
)


@app.route('/')
def index():
    return 'Welcome to the Google Calendar App! <a href="/authorize">Authorize</a>'


@app.route('/authorize')
def authorize():
    """Redirect user to Google's OAuth 2.0 server for authorization."""
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    session['state'] = state  # Save the state for CSRF protection
    return redirect(authorization_url)


@app.route('/oauth2callback')
def oauth2callback():
    """Handle the OAuth 2.0 server response."""
    flow.fetch_token(authorization_response=request.url)

    # Save credentials to the session
    credentials = flow.credentials
    session['credentials'] = credentials_to_dict(credentials)

    return redirect(url_for('calendar_events'))


@app.route('/calendar')
def calendar_events():
    """Retrieve and display Google Calendar events."""
    if 'credentials' not in session:
        return redirect(url_for('authorize'))

    # Load credentials from the session
    credentials = Credentials(**session['credentials'])

    try:
        # Build the Google Calendar API service
        service = build('calendar', 'v3', credentials=credentials)

        # Retrieve the upcoming 10 events
        events_result = service.events().list(
            calendarId='primary',
            maxResults=10,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        events = events_result.get('items', [])

        if not events:
            return 'No upcoming events found.'

        # Format events into HTML
        event_list = '<h1>Upcoming Events:</h1>'
        for event in events:
            start = event['start'].get('dateTime', event['start'].get('date'))
            event_list += f"<p>{start}: {event.get('summary', 'No Title')}</p>"

        return event_list

    except Exception as e:
        return f"An error occurred: {e}"


def credentials_to_dict(credentials):
    """Convert credentials to a serializable format."""
    return {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'scopes': credentials.scopes
    }


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)  # 确保监听所有网络接口
