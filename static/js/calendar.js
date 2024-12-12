document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    const eventModal = document.getElementById('eventModal');
    const eventDetailModal = document.getElementById('eventDetailModal');
    const form = document.getElementById('eventForm');
    const closeAdd = document.getElementById('closeAdd');
    const closeDetail = document.getElementById('closeDetail');
    const editEventButton = document.getElementById('editEvent');
    const deleteEventButton = document.getElementById('deleteEvent');

    let currentEvent = null;

    function formatTime(date) {
        const options = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true, 
        };
        return new Date(date).toLocaleTimeString('en-US', options);
    }

    // Request notification permission
    async function requestNotificationPermission() {
        if (Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    }

    // Initialize FullCalendar
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        aspectRatio: 1.5,
        timeZone: 'local',
        events: async function (fetchInfo, successCallback, failureCallback) {
            try {
                const response = await axios.get('/api/events');
                successCallback(response.data);
            } catch (error) {
                console.error('Error fetching events:', error);
                failureCallback(error);
            }
        },
        dateClick: function (info) {
            resetForm();
            form.date.value = info.dateStr;
            eventModal.style.display = 'block';
            currentEvent = null; // Clear current event
        },
        eventClick: function (info) {
            currentEvent = info.event;
        
            document.getElementById('eventTitle').textContent = currentEvent.title || 'No Title';
            document.getElementById('eventDate').textContent = `Date: ${currentEvent.start.toISOString().slice(0, 10)}`;
            document.getElementById('eventTime').textContent = `Time: ${formatTime(new Date(currentEvent.start))}`;
            document.getElementById('eventLocation').textContent = `Location: ${currentEvent.extendedProps.location || 'N/A'}`;
            document.getElementById('eventCategory').textContent = `Category: ${currentEvent.extendedProps.category || 'Personal'}`;
            document.getElementById('eventRecurrence').textContent = `Recurrence: ${currentEvent.extendedProps.recurrence || 'None'}`;
            eventDetailModal.style.display = 'block';
        }
        
    });

    calendar.render();

    // Reset form fields
    function resetForm() {
        form.title.value = '';
        form.date.value = '';
        form.time.value = '';
        form.location.value = '';
        form.category.value = 'personal';
        form.recurrence.value = 'none';
    }

    // Handle form submission
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const event = {
            title: form.title.value.trim(),
            date: form.date.value.trim(),
            time: form.time.value.trim(),
            location: form.location.value.trim(),
            category: form.category.value,
            recurrence: form.recurrence.value
        };

        try {
            if (currentEvent) {
                await axios.put(`/api/events/${currentEvent.id}`, event);
            } else {
                await axios.post('/api/events', event);
            }
            calendar.refetchEvents(); // Refresh events
            eventModal.style.display = 'none';
            resetForm(); // Clear form
        } catch (error) {
            console.error('Error saving event:', error);
        }
    });

    // Edit event
    editEventButton.addEventListener('click', function () {
        if (currentEvent) {
            form.title.value = currentEvent.title || '';
            form.date.value = currentEvent.start.toISOString().slice(0, 10);
            form.time.value = new Date(currentEvent.start).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
            form.location.value = currentEvent.extendedProps.location || '';
            form.category.value = currentEvent.extendedProps.category || 'personal';
            form.recurrence.value = currentEvent.extendedProps.recurrence || 'none';
    
            eventModal.style.display = 'block';
            eventDetailModal.style.display = 'none';
        }
    });


    

    // Delete event
    deleteEventButton.addEventListener('click', async function () {
        if (currentEvent) {
            try {
                await axios.delete(`/api/events/${currentEvent.id}`);
                calendar.refetchEvents();
                eventDetailModal.style.display = 'none';
                currentEvent = null; // Clear current event
            } catch (error) {
                console.error('Error deleting event:', error);
            }
        }
    });

    // Close modals
    closeAdd.addEventListener('click', function () {
        eventModal.style.display = 'none';
        resetForm(); // Clear form
    });

    closeDetail.addEventListener('click', function () {
        eventDetailModal.style.display = 'none';
    });

    // Close modal on outside click
    window.addEventListener('click', function (e) {
        if (e.target === eventModal) {
            eventModal.style.display = 'none';
            resetForm();
        }
        if (e.target === eventDetailModal) {
            eventDetailModal.style.display = 'none';
        }
    });

    // Show notification for upcoming events
    function showNotification(event) {
        if (Notification.permission === 'granted') {
            // Use browser notification if permission is granted
            const eventTime = new Date(event.start).toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const notification = new Notification('Upcoming Event Reminder', {
                body: `Event: ${event.title}\nTime: ${eventTime}`
            });

            notification.onclick = () => {
                window.focus(); // Focus the app if clicked
            };
        } else {
            // Fallback to custom notification popup
            showPopupNotification(event.title, `Scheduled for ${new Date(event.start).toLocaleString('en-US')}`);
        }
    }

    // Custom popup notification
    function showPopupNotification(title, message) {
        const notification = document.createElement('div');
        notification.className = 'notification';

        notification.innerHTML = `
            <p><strong>Reminder:</strong> ${title} is due in 30 minutes!</p>
            <button class="close-notification">X</button>
        `;

        // Append notification to the body
        document.body.appendChild(notification);

        // Add event listener for close button
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.remove();
        });

    // Ensure the notification stays visible until manually closed
    }


    // Check for upcoming events
    async function checkUpcomingEvents() {
        console.log("Checking for upcoming events...");
        const events = await fetchEvents();
        const currentTime = new Date();
        const timeWindow = 30 * 60 * 1000; // 30 minutes

        events.forEach(event => {
            const eventStartTime = new Date(event.start);
            const timeUntilEvent = eventStartTime - currentTime;

            if (timeUntilEvent <= timeWindow && timeUntilEvent > 0) {
                showNotification(event);
            }
        });
    }

    // Fetch events
    async function fetchEvents() {
        try {
            const response = await axios.get('/api/events');
            return response.data;
        } catch (error) {
            console.error('Error fetching events:', error);
            return [];
        }
    }

    // Check upcoming events periodically
    setInterval(checkUpcomingEvents, 60 * 1000);

    // Initial setup
    requestNotificationPermission();
    checkUpcomingEvents();
});

