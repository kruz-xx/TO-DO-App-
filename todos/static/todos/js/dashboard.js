document.addEventListener('DOMContentLoaded', () => {
    // API Endpoints
    const apiBaseUrl = '/api/todos/';

    // State variables
    let todosState = [];
    let selectedDate = new Date(); // default is today
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // DOM Elements
    const todoListContainer = document.getElementById('todo-list-container');
    const formToggleBtn = document.getElementById('toggle-add-form-btn');

    // Modal elements (from base.html)
    const taskModal = document.getElementById('task-modal');
    const modalCloseX = document.getElementById('modal-close-x');
    const modalBtnCancel = document.getElementById('modal-btn-cancel');
    const modalBtnSave = document.getElementById('modal-btn-save');
    const modalBtnDelete = document.getElementById('modal-btn-delete');
    const modalTitleLabel = document.getElementById('modal-title-label');
    const modalTaskId = document.getElementById('modal-task-id');

    // Modal form inputs
    const modalInputTitle = document.getElementById('modal-input-title');
    const modalInputDesc = document.getElementById('modal-input-desc');
    const modalInputPriority = document.getElementById('modal-input-priority');
    const modalInputDueDate = document.getElementById('modal-input-due-date');

    // Live Clock & Weather
    const liveTime = document.getElementById('live-time');
    const liveDate = document.getElementById('live-date');
    const weatherTemp = document.getElementById('weather-temp');
    const weatherIcon = document.getElementById('weather-icon');

    // Donut elements
    const donutSegment = document.querySelector('.donut-segment');
    const donutCount = document.getElementById('donut-count');
    const donutLabel = document.getElementById('donut-label');
    const statsCompletedCount = document.getElementById('stats-completed-count');
    const statsOngoingCount = document.getElementById('stats-ongoing-count');

    // Calendar Elements
    const calendarMonthYear = document.getElementById('calendar-month-year');
    const calendarGrid = document.getElementById('calendar-grid');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    // Initialize Page features
    initClock();
    initWeather();
    initCalendar();
    fetchTodos();
    window.addEventListener('todoSaved', fetchTodos);

    // Modal open/close helpers
    function openModal() {
        if (taskModal) taskModal.classList.add('open');
    }



    // Event Listeners
    if (formToggleBtn) {
        formToggleBtn.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('openTaskModal', {
                detail: {
                    title: 'Create New Task',
                    dueDate: formatDateForInput(selectedDate)
                }
            }));
        });
    }



    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
        });
    }

    // CSRF Helper
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // 1. Fetch and render Todos
    async function fetchTodos() {
        try {
            const res = await fetch(apiBaseUrl);
            if (res.ok) {
                todosState = await res.json();
                renderTodos();
                updateStatsRing();
                renderCalendar(); // re-render to mark dates with tasks
            }
        } catch (error) {
            console.error("Error fetching todos: ", error);
        }
    }

    function renderTodos() {
        if (!todoListContainer) return;
        todoListContainer.innerHTML = '';

        // Filter todos by selected date
        const targetDateString = formatDateForInput(selectedDate);
        const filteredTodos = todosState.filter(todo => todo.due_date === targetDateString);

        if (filteredTodos.length === 0) {
            todoListContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary); font-weight: 500;">
                    🎉 No tasks for this day! Relax or add a new one.
                </div>
            `;
            return;
        }

        filteredTodos.forEach(todo => {
            const todoItem = document.createElement('div');
            todoItem.className = 'todo-item';

            const badgeClass = `badge-${todo.priority}`;
            const isChecked = todo.completed ? 'checked' : '';
            const checkIcon = todo.completed ? 
                `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>` : '';

            todoItem.innerHTML = `
                <div class="todo-item-left">
                    <div class="todo-checkbox ${isChecked}" data-id="${todo.id}">
                        ${checkIcon}
                    </div>
                    <div class="todo-item-details">
                        <span class="todo-title">${escapeHtml(todo.title)}</span>
                        ${todo.description ? `<span class="todo-desc">${escapeHtml(todo.description)}</span>` : ''}
                          <div class="todo-badges">
                              <span class="badge ${badgeClass}">${capitalize(todo.priority)} Priority</span>
                              ${todo.due_date ? `<span class="badge badge-date">${todo.due_date}${todo.due_time ? ' ' + todo.due_time.substring(0, 5) : ''}</span>` : ''}
                              ${todo.labels ? todo.labels.split(',').map(label => `<span class="label-pill label-${escapeHtml(label.toLowerCase())}" style="font-size: 11px; padding: 3px 8px; cursor: default;">${escapeHtml(label)}</span>`).join('') : ''}
                          </div>
                    </div>
                </div>
                <div class="todo-item-right">
                    <button class="todo-delete-btn" data-id="${todo.id}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            `;

            todoListContainer.appendChild(todoItem);
        });

        // Add Listeners to check boxes and delete buttons
        document.querySelectorAll('.todo-checkbox').forEach(cb => {
            cb.addEventListener('click', () => toggleTodoComplete(cb.getAttribute('data-id')));
        });

        document.querySelectorAll('.todo-delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteTodo(btn.getAttribute('data-id')));
        });
    }

    // 2. Create Todo
    async function createTodo() {
        const title = (modalInputTitle ? modalInputTitle.value : '').trim();
        if (!title) {
            if (modalInputTitle) {
                modalInputTitle.focus();
                modalInputTitle.style.borderColor = 'var(--accent-color)';
            }
            return;
        }

        const data = {
            title: title,
            description: modalInputDesc ? modalInputDesc.value.trim() : '',
            priority: modalInputPriority ? modalInputPriority.value : 'medium',
            due_date: (modalInputDueDate && modalInputDueDate.value) ? modalInputDueDate.value : null,
            completed: false
        };

        try {
            const res = await fetch(apiBaseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                closeModal();
                await fetchTodos();
    window.addEventListener('todoSaved', fetchTodos);
            }
        } catch (error) {
            console.error("Error creating todo: ", error);
        }
    }

    // 3. Toggle Complete State
    async function toggleTodoComplete(id) {
        const todo = todosState.find(t => t.id == id);
        if (!todo) return;

        try {
            const res = await fetch(`${apiBaseUrl}${id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ completed: !todo.completed })
            });

            if (res.ok) {
                await fetchTodos();
    window.addEventListener('todoSaved', fetchTodos);
            }
        } catch (error) {
            console.error("Error updating todo: ", error);
        }
    }

    // 4. Delete Todo
    async function deleteTodo(id) {
        if (!confirm("Are you sure you want to delete this task?")) return;

        try {
            const res = await fetch(`${apiBaseUrl}${id}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });

            if (res.status === 204) {
                await fetchTodos();
    window.addEventListener('todoSaved', fetchTodos);
            }
        } catch (error) {
            console.error("Error deleting todo: ", error);
        }
    }

    // 5. Update Statistics Progress Ring
    function updateStatsRing() {
        if (!donutSegment) return;

        // Filter todos by selected date so ring matches the task list
        const targetDateString = formatDateForInput(selectedDate);
        const dailyTodos = todosState.filter(todo => todo.due_date === targetDateString);

        const total = dailyTodos.length;
        const completed = dailyTodos.filter(t => t.completed).length;
        const ongoing = total - completed;

        // Donut calculations
        // Circumference is 2 * PI * r = 2 * 3.14159 * 70 = ~440
        const circumference = 440;
        let strokeDashOffset = circumference;

        if (total > 0) {
            const completedRatio = completed / total;
            strokeDashOffset = circumference - (completedRatio * circumference);
        }

        donutSegment.style.strokeDashoffset = strokeDashOffset;

        // Set Center Text
        if (donutCount) {
            donutCount.textContent = `${completed}/${total}`;
        }
        if (donutLabel) {
            donutLabel.textContent = `done`;
        }

        // Set Legends
        if (statsCompletedCount) statsCompletedCount.textContent = `${completed} Completed`;
        if (statsOngoingCount) statsOngoingCount.textContent = `${ongoing} Ongoing`;
    }

    // 6. Mini Calendar Operations
    function initCalendar() {
        renderCalendar();
    }

    function renderCalendar() {
        if (!calendarMonthYear || !calendarGrid) return;

        calendarMonthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        calendarGrid.innerHTML = '';

        // Day labels (S, M, T, W, T, F, S)
        const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        days.forEach(d => {
            const cell = document.createElement('div');
            cell.className = 'calendar-day-label';
            cell.textContent = d;
            calendarGrid.appendChild(cell);
        });

        // Get first day of month and number of days
        const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
        const prevMonthLastDate = new Date(currentYear, currentMonth, 0).getDate();
        const currentMonthLastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

        // Muted days from previous month
        for (let i = firstDayIndex; i > 0; i--) {
            const cell = document.createElement('div');
            cell.className = 'calendar-day muted';
            cell.textContent = prevMonthLastDate - i + 1;
            calendarGrid.appendChild(cell);
        }

        // Days of current month
        for (let day = 1; day <= currentMonthLastDate; day++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-day';
            cell.textContent = day;

            const thisDate = new Date(currentYear, currentMonth, day);
            const dateStr = formatDateForInput(thisDate);

            // Highlight selected date
            if (thisDate.toDateString() === selectedDate.toDateString()) {
                cell.classList.add('active');
            }

            // Check if this date has any todos
            const hasTasks = todosState.some(todo => todo.due_date === dateStr);
            if (hasTasks) {
                cell.classList.add('has-events');
            }

            // Click listener
            cell.addEventListener('click', () => {
                selectedDate = thisDate;
                renderCalendar();
                renderTodos();
            });

            calendarGrid.appendChild(cell);
        }

        // Muted days from next month (fill grid)
        const totalCells = firstDayIndex + currentMonthLastDate;
        const remainingCells = 42 - totalCells; // Standard 6-row grid
        const cellsToAdd = remainingCells >= 7 ? remainingCells - 7 : remainingCells;
        
        for (let i = 1; i <= cellsToAdd; i++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-day muted';
            cell.textContent = i;
            calendarGrid.appendChild(cell);
        }
    }

    // 7. Live Clock
    function initClock() {
        updateClock();
        setInterval(updateClock, 1000);
    }

    function updateClock() {
        const now = new Date();
        
        // Time
        if (liveTime) {
            let hours = now.getHours();
            let minutes = now.getMinutes();
            let ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            liveTime.textContent = `${hours}:${minutes} ${ampm}`;
        }

        // Date
        if (liveDate) {
            const options = { weekday: 'long', month: 'short', day: 'numeric' };
            liveDate.textContent = now.toLocaleDateString('en-US', options);
        }
    }

    // 8. Cute Weather Simulator (based on time of day)
    function initWeather() {
        if (!weatherTemp || !weatherIcon) return;

        const hour = new Date().getHours();
        let temp, status, iconSvg;

        if (hour >= 6 && hour < 12) {
            temp = "22°C";
            status = "Sunny Morning";
            iconSvg = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
        } else if (hour >= 12 && hour < 17) {
            temp = "26°C";
            status = "Bright Sunny";
            iconSvg = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
        } else if (hour >= 17 && hour < 20) {
            temp = "20°C";
            status = "Cool Breeze";
            iconSvg = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 18a5 5 0 0 0-10 0"></path><line x1="12" y1="2" x2="12" y2="8"></line><line x1="4.22" y1="10.22" x2="8.46" y2="14.46"></line><line x1="1" y1="18" x2="3" y2="18"></line></svg>`;
        } else {
            temp = "16°C";
            status = "Clear Night";
            iconSvg = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
        }

        weatherTemp.textContent = temp;
        weatherIcon.innerHTML = iconSvg;
        
        const statusSpan = document.createElement('span');
        statusSpan.textContent = status;
        statusSpan.style.opacity = '0.7';
        statusSpan.style.fontSize = '12px';
        
        const container = weatherTemp.nextElementSibling;
        if (container) {
            container.innerHTML = `<div>${status}</div>`;
        }
    }

    // Helpers
    function formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function capitalize(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }
});
