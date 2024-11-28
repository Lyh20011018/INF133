document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth', // Default monthly view
        headerToolbar: {
            start: 'prev,next today', // Buttons on the left
            center: 'title',         // Title in the center
            end: 'dayGridMonth,timeGridWeek,timeGridDay' // View selection buttons on the right
        },
        events: '/api/calendar-events', // Load event data from the backend
        eventColor: '#378006',          // Event color
        editable: true,                 // Allow users to drag and drop events
    });
    calendar.render();
});
