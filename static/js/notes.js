document.addEventListener('DOMContentLoaded', function () {
    const notesList = document.getElementById('notes-list');
    const addNoteButton = document.getElementById('add-note-button');
    const noteModal = document.getElementById('noteModal');
    const closeNoteModal = document.getElementById('closeNote');
    const saveNoteButton = document.getElementById('saveNote');
    const deleteNoteButton = document.getElementById('deleteNote');
    const searchDateInput = document.getElementById('search-date');
    const searchTitleInput = document.getElementById('search-title');
    const noteTitleInput = document.getElementById('noteTitle');
    const noteContentInput = document.getElementById('noteContent');
    const noteDateDisplay = document.getElementById('noteDate');

    let notes = [];
    let currentNote = null;

    // Fetch notes from the backend
    async function fetchNotes() {
        try {
            const response = await axios.get('/api/notes');
            notes = response.data.map(note => ({
                ...note,
                date: note.date || new Date().toISOString().split('T')[0], // Ensure all notes have a date
            }));
            displayNotes();
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    }

    // Display notes in the list
    function displayNotes(filteredNotes = notes) {
        notesList.innerHTML = '';
        filteredNotes.forEach(note => {
            const noteItem = document.createElement('li');

            const titleElement = document.createElement('div');
            titleElement.textContent = note.title.length > 20 
                ? `${note.title.substring(0, 20)}...` 
                : note.title;

            const dateElement = document.createElement('small');
            dateElement.textContent = note.date;

            noteItem.addEventListener('click', () => openNoteModal(note));
            noteItem.appendChild(titleElement);
            noteItem.appendChild(dateElement);
            notesList.appendChild(noteItem);
        });
    }

    // Open the note modal
    function openNoteModal(note = null) {
        currentNote = note;

        if (note) {
            noteTitleInput.value = note.title;
            noteContentInput.value = note.content;
            noteDateDisplay.textContent = note.date || new Date().toISOString().split('T')[0];
            deleteNoteButton.style.display = 'block';
        } else {
            noteTitleInput.value = '';
            noteContentInput.value = '';
            noteDateDisplay.textContent = new Date().toISOString().split('T')[0];
            deleteNoteButton.style.display = 'none';
        }
        noteModal.style.display = 'block';
    }

    // Save note to the backend
    async function saveNoteToBackend(note) {
        try {
            if (note.id) {
                await axios.put(`/api/notes/${note.id}`, note);
            } else {
                const response = await axios.post('/api/notes', note);
                notes.push(response.data);
            }
            displayNotes();
        } catch (error) {
            console.error('Error saving note:', error);
        }
    }

    // Delete note from the backend
    async function deleteNoteFromBackend(noteId) {
        try {
            await axios.delete(`/api/notes/${noteId}`);
            notes = notes.filter(note => note.id !== noteId);
            displayNotes();
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    }

    // Save note
    saveNoteButton.addEventListener('click', async function () {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();
        const date = noteDateDisplay.textContent;

        if (!title || !content) {
            alert('Both title and content are required!');
            return;
        }

        const note = currentNote
            ? { ...currentNote, title, content, date }
            : { id: null, title, content, date };

        await saveNoteToBackend(note);
        noteModal.style.display = 'none';
    });

    // Delete note
    deleteNoteButton.addEventListener('click', async function () {
        if (currentNote && currentNote.id) {
            await deleteNoteFromBackend(currentNote.id);
        }
        noteModal.style.display = 'none';
    });

    // Search notes by date
    searchDateInput.addEventListener('input', function () {
        const date = searchDateInput.value;
        displayNotes(notes.filter(note => note.date === date));
    });

    // Search notes by title
    searchTitleInput.addEventListener('input', function () {
        const query = searchTitleInput.value.toLowerCase();
        displayNotes(notes.filter(note => note.title.toLowerCase().includes(query)));
    });

    // Close modal
    closeNoteModal.addEventListener('click', function () {
        noteModal.style.display = 'none';
    });

    // Add new note
    addNoteButton.addEventListener('click', function () {
        openNoteModal();
    });

    // Initialize the application
    fetchNotes();
});