document.addEventListener('DOMContentLoaded', function () {
    const taskList = document.getElementById('todo-list');
    const completedList = document.getElementById('completed-tasks');
    const taskModal = document.getElementById('taskModal');
    const addTaskButton = document.getElementById('add-task-button');
    const closeTask = document.getElementById('closeTask');
    const saveTask = document.getElementById('saveTask');
    const deleteTask = document.getElementById('deleteTask');
    const taskTitle = document.getElementById('taskTitle');
    const taskDueDate = document.getElementById('taskDueDate');
    const taskCategory = document.getElementById('taskCategory');

    let tasks = [];
    let currentTask = null;

    // Format date for display
    function formatDate(dateString) {
        if (!dateString) return 'No Due Date';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    // Fetch tasks from the API
    async function fetchTasks() {
        try {
            const response = await axios.get('/api/tasks');
            tasks = response.data;
            updateTaskList(tasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            alert('Failed to fetch tasks from the server.');
        }
    }

    // Fetch events from the calendar API (14 days from today)
    async function fetchCalendarEvents() {
        try {
            const response = await axios.get('/api/events');
            const events = response.data;

            const upcomingEvents = events.filter(event => {
                const eventDate = new Date(event.start);
                const today = new Date();
                const twoWeeksLater = new Date();
                twoWeeksLater.setDate(today.getDate() + 14);

                return eventDate >= today && eventDate <= twoWeeksLater;
            });

            upcomingEvents.forEach(event => {
                if (!tasks.some(task => task.title === event.title && task.due_date === event.start)) {
                    tasks.push({
                        id: `cal-${event.id}`,
                        title: event.title,
                        due_date: event.start,
                        category: event.category || 'calendar',
                        completed: false,
                        isFromCalendar: true
                    });
                }
            });

            updateTaskList(tasks);
        } catch (error) {
            console.error('Error fetching calendar events:', error);
        }
    }

    // Update Task List UI
    function updateTaskList(tasks) {
        taskList.innerHTML = '';
        completedList.innerHTML = '';

        tasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            taskItem.dataset.id = task.id;

            const title = document.createElement('span');
            title.textContent = task.title;
            title.className = 'task-title';
            taskItem.appendChild(title);

            const dueDate = document.createElement('span');
            dueDate.className = 'task-due';
            dueDate.textContent = formatDate(task.due_date);
            taskItem.appendChild(dueDate);

            // Add buttons to toggle completion
            if (!task.completed) {
                const markCompleteButton = document.createElement('button');
                markCompleteButton.textContent = 'Mark as Complete';
                markCompleteButton.className = 'mark-complete';
                markCompleteButton.addEventListener('click', (event) => {
                    event.stopPropagation(); // Prevent modal from opening
                    toggleTaskCompletion(task, true);
                });
                taskItem.appendChild(markCompleteButton);
            } else {
                const markIncompleteButton = document.createElement('button');
                markIncompleteButton.textContent = 'Mark as Incomplete';
                markIncompleteButton.className = 'mark-incomplete';
                markIncompleteButton.addEventListener('click', (event) => {
                    event.stopPropagation(); // Prevent modal from opening
                    toggleTaskCompletion(task, false);
                });
                taskItem.appendChild(markIncompleteButton);
            }

            // Open modal on task item click (excluding button clicks)
            taskItem.addEventListener('click', () => openTaskModal(task));

            if (task.completed) {
                completedList.appendChild(taskItem);
            } else {
                taskList.appendChild(taskItem);
            }
        });
    }

    // Toggle task completion
    async function toggleTaskCompletion(task, completed) {
        try {
            task.completed = completed;
            await axios.put(`/api/tasks/${task.id}`, task);
            fetchTasks();
        } catch (error) {
            console.error('Error updating task completion:', error);
        }
    }

    // Open Task Modal
    function openTaskModal(task) {
        currentTask = task;
        taskTitle.value = task.title || '';
        taskDueDate.value = task.due_date || '';
        taskCategory.value = task.category || '';
        taskModal.style.display = 'block';
    }

    // Save Task
    saveTask.addEventListener('click', async () => {
        const newTask = {
            title: taskTitle.value.trim(),
            due_date: taskDueDate.value,
            category: taskCategory.value,
            completed: currentTask ? currentTask.completed : false,
        };

        try {
            if (currentTask) {
                await axios.put(`/api/tasks/${currentTask.id}`, newTask);
            } else {
                const response = await axios.post('/api/tasks', newTask);
                newTask.id = response.data.id;
            }
            fetchTasks();
            taskModal.style.display = 'none';
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Failed to save the task to the server.');
        }
    });

    // Delete Task
    deleteTask.addEventListener('click', async () => {
        if (!currentTask) return;

        try {
            await axios.delete(`/api/tasks/${currentTask.id}`);
            fetchTasks();
            taskModal.style.display = 'none';
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Failed to delete the task.');
        }
    });

    // Close Task Modal
    closeTask.addEventListener('click', () => {
        taskModal.style.display = 'none';
    });

    // Add Task Button
    addTaskButton.addEventListener('click', () => {
        currentTask = null;
        taskTitle.value = '';
        taskDueDate.value = '';
        taskCategory.value = '';
        taskModal.style.display = 'block';
    });

    // Initial Fetch
    fetchTasks();
    fetchCalendarEvents();
});
