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

    // Initialize FullCalendar
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        aspectRatio: 1.5,
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

            // Populate event details
            document.getElementById('eventTitle').textContent = currentEvent.title || 'No Title';
            document.getElementById('eventDate').textContent = `Date: ${currentEvent.start.toISOString().slice(0, 10)}`;
            document.getElementById('eventTime').textContent = `Time: ${currentEvent.start.toISOString().slice(11, 16)}`;
            document.getElementById('eventLocation').textContent = `Location: ${currentEvent.extendedProps.location || 'N/A'}`;
            document.getElementById('eventCategory').textContent = `Category: ${currentEvent.extendedProps.category || 'Personal'}`;

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
    }

    // Handle form submission
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const event = {
            title: form.title.value.trim(),
            date: form.date.value.trim(),
            time: form.time.value.trim(),
            location: form.location.value.trim(),
            category: form.category.value
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
            form.time.value = currentEvent.start.toISOString().slice(11, 16);
            form.location.value = currentEvent.extendedProps.location || '';
            form.category.value = currentEvent.extendedProps.category || 'personal';
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
});
