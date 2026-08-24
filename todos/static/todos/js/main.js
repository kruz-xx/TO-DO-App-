document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // SIDEBAR DRAWER TOGGLE FUNCTIONALITY
    // ==========================================
    const sidebarToggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('app-sidebar');

    const overlay = document.createElement('div');
    overlay.id = 'sidebar-overlay';
    overlay.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.3);
        z-index: 998; display: none; backdrop-filter: blur(2px);
    `;
    document.body.appendChild(overlay);

    function openSidebar() {
        if (!sidebar) return;
        sidebar.classList.add('open');
        overlay.style.display = 'block';
        if (sidebarToggleBtn) {
            sidebarToggleBtn.setAttribute('aria-expanded', 'true');
            sidebarToggleBtn.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>`;
        }
    }

    function closeSidebar() {
        if (!sidebar) return;
        sidebar.classList.remove('open');
        overlay.style.display = 'none';
        if (sidebarToggleBtn) {
            sidebarToggleBtn.setAttribute('aria-expanded', 'false');
            sidebarToggleBtn.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="4" y1="12" x2="20" y2="12"></line>
                    <line x1="4" y1="6" x2="20" y2="6"></line>
                    <line x1="4" y1="18" x2="20" y2="18"></line>
                </svg>`;
        }
    }

    if (sidebarToggleBtn && sidebar) {
        sidebarToggleBtn.addEventListener('click', () => {
            if (sidebar.classList.contains('open')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
        overlay.addEventListener('click', closeSidebar);
    }

    // ==========================================
    // THEME SWITCHER FUNCTIONALITY
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const darkIcon = document.querySelector('.theme-icon-dark');
    const lightIcon = document.querySelector('.theme-icon-light');

    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }

    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        if (theme === 'dark') {
            if (darkIcon) darkIcon.style.display = 'none';
            if (lightIcon) lightIcon.style.display = 'block';
        } else {
            if (darkIcon) darkIcon.style.display = 'block';
            if (lightIcon) lightIcon.style.display = 'none';
        }
    }

    // =========================================================
    // GOOGLE APPS / MATERIAL 3 DATE & TIME PICKER DIALOG ENGINE
    // =========================================================
    let activeDialogBackdrop = null;

    function closeActiveDialog() {
        if (activeDialogBackdrop) {
            activeDialogBackdrop.remove();
            activeDialogBackdrop = null;
        }
    }

    const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthNamesFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // --- GOOGLE MATERIAL DATE PICKER DIALOG ---
    function openGoogleDatePicker(targetInput) {
        closeActiveDialog();

        let selYear, selMonth, selDay;
        const currentVal = (targetInput.value || '').trim();
        if (currentVal && /^\d{4}-\d{2}-\d{2}$/.test(currentVal)) {
            const parts = currentVal.split('-');
            selYear = parseInt(parts[0], 10);
            selMonth = parseInt(parts[1], 10) - 1;
            selDay = parseInt(parts[2], 10);
        } else {
            const now = new Date();
            selYear = now.getFullYear();
            selMonth = now.getMonth();
            selDay = now.getDate();
        }

        let viewYear = selYear;
        let viewMonth = selMonth;

        const backdrop = document.createElement('div');
        backdrop.className = 'g-picker-backdrop';
        backdrop.id = 'google-datepicker-dialog';

        const card = document.createElement('div');
        card.className = 'g-dialog-card';

        function renderDatePicker() {
            const tempDate = new Date(selYear, selMonth, selDay);
            const dayName = dayNamesShort[tempDate.getDay()];
            const headerTitle = `${dayName}, ${monthNamesShort[selMonth]} ${selDay}, ${selYear}`;

            const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
            const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
            const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

            const today = new Date();
            const isTodayMonth = today.getFullYear() === viewYear && today.getMonth() === viewMonth;

            let html = `
                <div class="g-dialog-header">
                    <span class="g-dialog-overline">SELECT DATE</span>
                    <div class="g-dialog-title" id="g-dp-header-text">${headerTitle}</div>
                </div>
                <div class="g-dialog-body">
                    <div class="g-calendar-nav">
                        <span class="g-month-label">${monthNamesFull[viewMonth]} ${viewYear}</span>
                        <div class="g-nav-actions">
                            <button type="button" class="g-icon-btn" id="g-dp-prev-btn" aria-label="Previous Month">‹</button>
                            <button type="button" class="g-icon-btn" id="g-dp-next-btn" aria-label="Next Month">›</button>
                        </div>
                    </div>
                    <div class="g-weekdays-row">
                        <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                    </div>
                    <div class="g-days-grid">
            `;

            // Prev month fill
            for (let i = firstDayIndex - 1; i >= 0; i--) {
                html += `<div class="g-day-btn other-month">${daysInPrevMonth - i}</div>`;
            }

            // Current month days
            for (let d = 1; d <= daysInMonth; d++) {
                const isSelected = selYear === viewYear && selMonth === viewMonth && selDay === d;
                const isToday = isTodayMonth && today.getDate() === d;
                let classes = 'g-day-btn';
                if (isSelected) classes += ' selected';
                if (isToday) classes += ' today';

                html += `<button type="button" class="${classes}" data-day="${d}">${d}</button>`;
            }

            // Next month fill
            const totalCells = firstDayIndex + daysInMonth;
            const remaining = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
            for (let n = 1; n <= remaining; n++) {
                html += `<div class="g-day-btn other-month">${n}</div>`;
            }

            html += `
                    </div>
                </div>
                <div class="g-dialog-actions">
                    <button type="button" class="g-text-btn" id="g-dp-clear">Clear</button>
                    <div style="flex: 1;"></div>
                    <button type="button" class="g-text-btn" id="g-dp-cancel">Cancel</button>
                    <button type="button" class="g-text-btn g-primary-btn" id="g-dp-ok">OK</button>
                </div>
            `;

            card.innerHTML = html;

            // Nav Listeners
            card.querySelector('#g-dp-prev-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                viewMonth--;
                if (viewMonth < 0) { viewMonth = 11; viewYear--; }
                renderDatePicker();
            });

            card.querySelector('#g-dp-next-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                viewMonth++;
                if (viewMonth > 11) { viewMonth = 0; viewYear++; }
                renderDatePicker();
            });

            // Day click
            card.querySelectorAll('.g-day-btn[data-day]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selDay = parseInt(btn.getAttribute('data-day'), 10);
                    selMonth = viewMonth;
                    selYear = viewYear;
                    renderDatePicker();
                });
            });

            // Clear
            card.querySelector('#g-dp-clear').addEventListener('click', (e) => {
                e.stopPropagation();
                targetInput.value = '';
                targetInput.dispatchEvent(new Event('change', { bubbles: true }));
                closeActiveDialog();
            });

            // Cancel
            card.querySelector('#g-dp-cancel').addEventListener('click', (e) => {
                e.stopPropagation();
                closeActiveDialog();
            });

            // OK
            card.querySelector('#g-dp-ok').addEventListener('click', (e) => {
                e.stopPropagation();
                const formatted = `${selYear}-${String(selMonth + 1).padStart(2, '0')}-${String(selDay).padStart(2, '0')}`;
                targetInput.value = formatted;
                targetInput.dispatchEvent(new Event('change', { bubbles: true }));
                closeActiveDialog();
            });
        }

        renderDatePicker();
        backdrop.appendChild(card);
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) closeActiveDialog();
        });
        document.body.appendChild(backdrop);
        activeDialogBackdrop = backdrop;
    }

    // --- GOOGLE MATERIAL TIME PICKER DIALOG ---
    function openGoogleTimePicker(targetInput) {
        closeActiveDialog();

        let selHour = 9;
        let selMinute = 0;
        let selAmPm = 'AM';
        let activeTab = 'hour'; // 'hour' or 'minute'

        const currentVal = (targetInput.value || '').trim();
        if (currentVal) {
            const timeParts = currentVal.split(':');
            let h = parseInt(timeParts[0], 10);
            const m = parseInt(timeParts[1] || '0', 10);
            if (!isNaN(h) && !isNaN(m)) {
                if (h === 0) { selHour = 12; selAmPm = 'AM'; }
                else if (h === 12) { selHour = 12; selAmPm = 'PM'; }
                else if (h > 12) { selHour = h - 12; selAmPm = 'PM'; }
                else { selHour = h; selAmPm = 'AM'; }
                selMinute = Math.round(m / 5) * 5;
                if (selMinute >= 60) selMinute = 55;
            }
        }

        const backdrop = document.createElement('div');
        backdrop.className = 'g-picker-backdrop';
        backdrop.id = 'google-timepicker-dialog';

        const card = document.createElement('div');
        card.className = 'g-dialog-card';

        function renderTimePicker() {
            let html = `
                <div class="g-dialog-header">
                    <span class="g-dialog-overline">SELECT TIME</span>
                    <div class="g-time-display-row">
                        <div class="g-time-box-group">
                            <button type="button" class="g-time-box ${activeTab === 'hour' ? 'active' : ''}" id="g-tp-tab-hour">
                                ${String(selHour).padStart(2, '0')}
                            </button>
                            <span class="g-time-colon">:</span>
                            <button type="button" class="g-time-box ${activeTab === 'minute' ? 'active' : ''}" id="g-tp-tab-minute">
                                ${String(selMinute).padStart(2, '0')}
                            </button>
                        </div>
                        <div class="g-ampm-switch">
                            <button type="button" class="g-ampm-btn ${selAmPm === 'AM' ? 'active' : ''}" id="g-tp-am-btn">AM</button>
                            <button type="button" class="g-ampm-btn ${selAmPm === 'PM' ? 'active' : ''}" id="g-tp-pm-btn">PM</button>
                        </div>
                    </div>
                </div>
                <div class="g-dialog-body">
                    <div class="g-quick-times-row">
                        <button type="button" class="g-preset-pill" data-h="9" data-m="0" data-ampm="AM">09:00 AM</button>
                        <button type="button" class="g-preset-pill" data-h="12" data-m="0" data-ampm="PM">12:00 PM</button>
                        <button type="button" class="g-preset-pill" data-h="3" data-m="0" data-ampm="PM">03:00 PM</button>
                        <button type="button" class="g-preset-pill" data-h="6" data-m="0" data-ampm="PM">06:00 PM</button>
                        <button type="button" class="g-preset-pill" data-h="9" data-m="0" data-ampm="PM">09:00 PM</button>
                    </div>

                    <div class="g-selector-title">${activeTab === 'hour' ? 'Select Hour (1 - 12)' : 'Select Minutes'}</div>
                    <div class="g-selector-grid" id="g-tp-grid">
            `;

            if (activeTab === 'hour') {
                for (let h = 1; h <= 12; h++) {
                    const isSel = selHour === h ? 'active' : '';
                    html += `<button type="button" class="g-grid-chip ${isSel}" data-hour="${h}">${String(h).padStart(2, '0')}</button>`;
                }
            } else {
                const minuteOptions = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
                minuteOptions.forEach(m => {
                    const isSel = selMinute === m ? 'active' : '';
                    html += `<button type="button" class="g-grid-chip ${isSel}" data-minute="${m}">:${String(m).padStart(2, '0')}</button>`;
                });
            }

            html += `
                    </div>
                </div>
                <div class="g-dialog-actions">
                    <button type="button" class="g-text-btn" id="g-tp-clear">Clear</button>
                    <div style="flex: 1;"></div>
                    <button type="button" class="g-text-btn" id="g-tp-cancel">Cancel</button>
                    <button type="button" class="g-text-btn g-primary-btn" id="g-tp-ok">OK</button>
                </div>
            `;

            card.innerHTML = html;

            // Tab switching
            card.querySelector('#g-tp-tab-hour').addEventListener('click', (e) => {
                e.stopPropagation();
                activeTab = 'hour';
                renderTimePicker();
            });

            card.querySelector('#g-tp-tab-minute').addEventListener('click', (e) => {
                e.stopPropagation();
                activeTab = 'minute';
                renderTimePicker();
            });

            // AM/PM
            card.querySelector('#g-tp-am-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                selAmPm = 'AM';
                renderTimePicker();
            });

            card.querySelector('#g-tp-pm-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                selAmPm = 'PM';
                renderTimePicker();
            });

            // Preset pills
            card.querySelectorAll('.g-preset-pill').forEach(pill => {
                pill.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selHour = parseInt(pill.getAttribute('data-h'), 10);
                    selMinute = parseInt(pill.getAttribute('data-m'), 10);
                    selAmPm = pill.getAttribute('data-ampm');
                    renderTimePicker();
                });
            });

            // Grid chips
            if (activeTab === 'hour') {
                card.querySelectorAll('.g-grid-chip[data-hour]').forEach(chip => {
                    chip.addEventListener('click', (e) => {
                        e.stopPropagation();
                        selHour = parseInt(chip.getAttribute('data-hour'), 10);
                        activeTab = 'minute'; // Automatically step to minutes like Google Material Time Picker!
                        renderTimePicker();
                    });
                });
            } else {
                card.querySelectorAll('.g-grid-chip[data-minute]').forEach(chip => {
                    chip.addEventListener('click', (e) => {
                        e.stopPropagation();
                        selMinute = parseInt(chip.getAttribute('data-minute'), 10);
                        renderTimePicker();
                    });
                });
            }

            // Clear
            card.querySelector('#g-tp-clear').addEventListener('click', (e) => {
                e.stopPropagation();
                targetInput.value = '';
                targetInput.dispatchEvent(new Event('change', { bubbles: true }));
                closeActiveDialog();
            });

            // Cancel
            card.querySelector('#g-tp-cancel').addEventListener('click', (e) => {
                e.stopPropagation();
                closeActiveDialog();
            });

            // OK
            card.querySelector('#g-tp-ok').addEventListener('click', (e) => {
                e.stopPropagation();
                let hour24 = selHour;
                if (selAmPm === 'AM' && hour24 === 12) hour24 = 0;
                if (selAmPm === 'PM' && hour24 < 12) hour24 += 12;
                const formattedTime = `${String(hour24).padStart(2, '0')}:${String(selMinute).padStart(2, '0')}`;
                targetInput.value = formattedTime;
                targetInput.dispatchEvent(new Event('change', { bubbles: true }));
                closeActiveDialog();
            });
        }

        renderTimePicker();
        backdrop.appendChild(card);
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) closeActiveDialog();
        });
        document.body.appendChild(backdrop);
        activeDialogBackdrop = backdrop;
    }

    // Attach click listeners globally to date/time triggers
    function initCustomPickerTriggers() {
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('.custom-picker-trigger');
            if (trigger) {
                const targetId = trigger.getAttribute('data-target');
                const targetType = trigger.getAttribute('data-type');
                const targetInput = document.getElementById(targetId);
                if (targetInput) {
                    if (targetType === 'date') {
                        openGoogleDatePicker(targetInput);
                    } else if (targetType === 'time') {
                        openGoogleTimePicker(targetInput);
                    }
                }
                return;
            }

            // Direct input clicks
            if (e.target.classList.contains('custom-date-input')) {
                openGoogleDatePicker(e.target);
            } else if (e.target.classList.contains('custom-time-input')) {
                openGoogleTimePicker(e.target);
            }
        });
    }

    initCustomPickerTriggers();

    // ==========================================
    // GLOBAL TASK MODAL LOGIC
    // ==========================================
    const taskModal = document.getElementById('task-modal');
    if (!taskModal) return;

    const modalCloseX = document.getElementById('modal-close-x');
    const modalBtnCancel = document.getElementById('modal-btn-cancel');
    const modalBtnSave = document.getElementById('modal-btn-save');
    const modalBtnDelete = document.getElementById('modal-btn-delete');
    const modalTitleLabel = document.getElementById('modal-title-label');
    
    // Form Inputs
    const modalTaskId = document.getElementById('modal-task-id');
    const modalInputTitle = document.getElementById('modal-input-title');
    const modalInputDesc = document.getElementById('modal-input-desc');
    const modalInputPriority = document.getElementById('modal-input-priority');
    const modalInputDueDate = document.getElementById('modal-input-due-date');
    const modalInputDueTime = document.getElementById('modal-input-due-time');
    
    // Labels UI
    const labelPills = document.querySelectorAll('#task-modal .label-pill');
    
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

    // Toggle Label pills
    labelPills.forEach(pill => {
        pill.addEventListener('click', () => {
            pill.classList.toggle('active');
            if (pill.classList.contains('active')) {
                pill.style.boxShadow = '0 0 0 2px white, 0 0 0 4px ' + getComputedStyle(pill).backgroundColor;
            } else {
                pill.style.boxShadow = 'none';
            }
        });
    });

    function getSelectedLabels() {
        let labels = [];
        labelPills.forEach(pill => {
            if (pill.classList.contains('active')) {
                labels.push(pill.getAttribute('data-label'));
            }
        });
        return labels.join(',');
    }

    function clearSelectedLabels() {
        labelPills.forEach(pill => {
            pill.classList.remove('active');
            pill.style.boxShadow = 'none';
        });
    }

    function openModal() {
        taskModal.classList.add('open');
    }

    function closeModal() {
        taskModal.classList.remove('open');
        closeActiveDialog();
        if (modalInputTitle) modalInputTitle.value = '';
        if (modalInputDesc) modalInputDesc.value = '';
        if (modalInputPriority) modalInputPriority.value = 'medium';
        if (modalInputDueDate) modalInputDueDate.value = '';
        if (modalInputDueTime) modalInputDueTime.value = '';
        if (modalTaskId) modalTaskId.value = '';
        clearSelectedLabels();
    }

    if (modalCloseX) modalCloseX.addEventListener('click', closeModal);
    if (modalBtnCancel) modalBtnCancel.addEventListener('click', closeModal);
    
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) closeModal();
    });

    window.addEventListener('openTaskModal', (e) => {
        if (modalTitleLabel && e.detail.title) modalTitleLabel.textContent = e.detail.title;
        if (modalBtnDelete) modalBtnDelete.style.display = 'none';
        if (modalTaskId) modalTaskId.value = '';
        
        if (modalInputDueDate && e.detail.dueDate) {
            modalInputDueDate.value = e.detail.dueDate;
        }
        if (modalInputDueTime && e.detail.dueTime) {
            modalInputDueTime.value = e.detail.dueTime;
        }
        openModal();
    });

    if (modalBtnSave) {
        modalBtnSave.addEventListener('click', async () => {
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
                due_time: (modalInputDueTime && modalInputDueTime.value) ? modalInputDueTime.value : null,
                labels: getSelectedLabels(),
                completed: false
            };

            try {
                const res = await fetch('/api/todos/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify(data)
                });

                if (res.ok) {
                    closeModal();
                    window.dispatchEvent(new Event('todoSaved'));
                }
            } catch (error) {
                console.error("Error creating todo: ", error);
            }
        });
    }
});

// ==========================================
// GLOBAL TOAST NOTIFICATION ENGINE
// ==========================================
window.showToast = function(message, type = 'success', duration = 3500) {
    let container = document.getElementById('global-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'global-toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;

    let iconHtml = '✨';
    if (type === 'success') {
        iconHtml = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else if (type === 'error') {
        iconHtml = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else {
        iconHtml = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
        <div class="toast-icon-wrap">${iconHtml}</div>
        <div class="toast-message">${message}</div>
        <button class="toast-close-btn" aria-label="Close">&times;</button>
    `;

    container.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    const closeBtn = toast.querySelector('.toast-close-btn');
    const dismiss = () => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => {
            toast.remove();
        }, 300);
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', dismiss);
    }

    if (duration > 0) {
        setTimeout(dismiss, duration);
    }
};

