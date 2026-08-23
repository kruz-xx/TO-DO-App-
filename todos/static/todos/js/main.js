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

    // ==========================================
    // BUILT-IN BESPOKE DATE & TIME PICKER ENGINE
    // ==========================================
    let activePickerPopup = null;
    let activePickerOverlay = null;

    function closeActivePicker() {
        if (activePickerPopup) {
            activePickerPopup.remove();
            activePickerPopup = null;
        }
        if (activePickerOverlay) {
            activePickerOverlay.remove();
            activePickerOverlay = null;
        }
    }

    function createPickerOverlay() {
        closeActivePicker();
        const overlay = document.createElement('div');
        overlay.className = 'custom-picker-overlay';
        overlay.addEventListener('click', closeActivePicker);
        document.body.appendChild(overlay);
        activePickerOverlay = overlay;
        return overlay;
    }

    function positionPopup(popup, triggerElement) {
        const rect = triggerElement.getBoundingClientRect();
        const popupWidth = 320;
        let left = rect.left;
        let top = rect.bottom + 8;

        if (left + popupWidth > window.innerWidth - 16) {
            left = window.innerWidth - popupWidth - 16;
        }
        if (left < 16) left = 16;

        if (top + 340 > window.innerHeight && rect.top > 350) {
            top = rect.top - 340;
        }

        popup.style.left = `${left}px`;
        popup.style.top = `${top}px`;
    }

    // --- CUSTOM DATE PICKER POPUP ---
    function openCustomDatePicker(targetInput, triggerEl) {
        createPickerOverlay();

        let selectedYear, selectedMonth, selectedDay;
        const currentVal = targetInput.value.trim();
        if (currentVal && /^\d{4}-\d{2}-\d{2}$/.test(currentVal)) {
            const parts = currentVal.split('-');
            selectedYear = parseInt(parts[0], 10);
            selectedMonth = parseInt(parts[1], 10) - 1;
            selectedDay = parseInt(parts[2], 10);
        } else {
            const now = new Date();
            selectedYear = now.getFullYear();
            selectedMonth = now.getMonth();
            selectedDay = now.getDate();
        }

        let viewYear = selectedYear;
        let viewMonth = selectedMonth;

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const popup = document.createElement('div');
        popup.className = 'custom-picker-popup';
        popup.id = 'custom-date-picker-popup';

        function renderCalendar() {
            const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
            const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
            const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

            const today = new Date();
            const isTodayMonth = today.getFullYear() === viewYear && today.getMonth() === viewMonth;

            let html = `
                <div class="picker-header">
                    <button type="button" class="picker-nav-btn" id="dp-prev-month" aria-label="Previous Month">‹</button>
                    <div class="picker-title">${monthNames[viewMonth]} ${viewYear}</div>
                    <button type="button" class="picker-nav-btn" id="dp-next-month" aria-label="Next Month">›</button>
                </div>
                <div class="picker-weekdays">
                    <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                </div>
                <div class="picker-days-grid">
            `;

            // Prev month padding days
            for (let i = firstDayIndex - 1; i >= 0; i--) {
                html += `<div class="picker-day-cell other-month">${daysInPrevMonth - i}</div>`;
            }

            // Current month days
            for (let d = 1; d <= daysInMonth; d++) {
                const isSelected = selectedYear === viewYear && selectedMonth === viewMonth && selectedDay === d && currentVal;
                const isToday = isTodayMonth && today.getDate() === d;
                let cellClass = 'picker-day-cell';
                if (isSelected) cellClass += ' selected';
                if (isToday) cellClass += ' today';

                html += `<div class="${cellClass}" data-day="${d}">${d}</div>`;
            }

            // Next month fill days (up to 42 total cells)
            const totalCells = firstDayIndex + daysInMonth;
            const remaining = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
            for (let n = 1; n <= remaining; n++) {
                html += `<div class="picker-day-cell other-month">${n}</div>`;
            }

            html += `
                </div>
                <div class="picker-footer">
                    <button type="button" class="picker-action-btn" id="dp-clear-btn">Clear</button>
                    <button type="button" class="picker-action-btn" id="dp-today-btn">Today</button>
                </div>
            `;

            popup.innerHTML = html;

            // Event Listeners
            popup.querySelector('#dp-prev-month').addEventListener('click', (e) => {
                e.stopPropagation();
                viewMonth--;
                if (viewMonth < 0) { viewMonth = 11; viewYear--; }
                renderCalendar();
            });

            popup.querySelector('#dp-next-month').addEventListener('click', (e) => {
                e.stopPropagation();
                viewMonth++;
                if (viewMonth > 11) { viewMonth = 0; viewYear++; }
                renderCalendar();
            });

            popup.querySelectorAll('.picker-day-cell[data-day]').forEach(cell => {
                cell.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const day = parseInt(cell.getAttribute('data-day'), 10);
                    const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    targetInput.value = formatted;
                    targetInput.dispatchEvent(new Event('change', { bubbles: true }));
                    closeActivePicker();
                });
            });

            popup.querySelector('#dp-today-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                const now = new Date();
                const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                targetInput.value = formatted;
                targetInput.dispatchEvent(new Event('change', { bubbles: true }));
                closeActivePicker();
            });

            popup.querySelector('#dp-clear-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                targetInput.value = '';
                targetInput.dispatchEvent(new Event('change', { bubbles: true }));
                closeActivePicker();
            });
        }

        renderCalendar();
        document.body.appendChild(popup);
        activePickerPopup = popup;
        positionPopup(popup, triggerEl);
    }

    // --- CUSTOM TIME PICKER POPUP ---
    function openCustomTimePicker(targetInput, triggerEl) {
        createPickerOverlay();

        let selHour = 9;
        let selMinute = 0;
        let selAmPm = 'AM';

        const currentVal = targetInput.value.trim();
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

        const popup = document.createElement('div');
        popup.className = 'custom-picker-popup';
        popup.id = 'custom-time-picker-popup';

        function renderTimePicker() {
            const displayStr = `${String(selHour).padStart(2, '0')}:${String(selMinute).padStart(2, '0')} ${selAmPm}`;

            let html = `
                <div class="picker-header">
                    <div class="picker-title">Select Time</div>
                    <button type="button" class="picker-action-btn" id="tp-clear-btn" style="color:var(--text-secondary);">Clear</button>
                </div>
                
                <div class="timepicker-preview">${displayStr}</div>

                <div class="timepicker-section-title">Hours</div>
                <div class="timepicker-grid" id="tp-hours-grid">
            `;

            for (let h = 1; h <= 12; h++) {
                const isSel = selHour === h ? 'selected' : '';
                html += `<div class="timepicker-chip ${isSel}" data-hour="${h}">${String(h).padStart(2, '0')}</div>`;
            }

            html += `
                </div>
                <div class="timepicker-section-title">Minutes</div>
                <div class="timepicker-grid" id="tp-minutes-grid">
            `;

            const minutesList = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
            minutesList.forEach(m => {
                const isSel = selMinute === m ? 'selected' : '';
                html += `<div class="timepicker-chip ${isSel}" data-minute="${m}">:${String(m).padStart(2, '0')}</div>`;
            });

            html += `
                </div>
                <div class="timepicker-ampm-row">
                    <div class="ampm-btn ${selAmPm === 'AM' ? 'selected' : ''}" data-ampm="AM">AM</div>
                    <div class="ampm-btn ${selAmPm === 'PM' ? 'selected' : ''}" data-ampm="PM">PM</div>
                </div>

                <div class="timepicker-section-title">Quick Presets</div>
                <div class="timepicker-presets">
                    <span class="preset-chip" data-h="9" data-m="0" data-ampm="AM">09:00 AM</span>
                    <span class="preset-chip" data-h="12" data-m="0" data-ampm="PM">12:00 PM</span>
                    <span class="preset-chip" data-h="3" data-m="0" data-ampm="PM">03:00 PM</span>
                    <span class="preset-chip" data-h="6" data-m="0" data-ampm="PM">06:00 PM</span>
                    <span class="preset-chip" data-h="9" data-m="0" data-ampm="PM">09:00 PM</span>
                </div>

                <button type="button" class="timepicker-confirm-btn" id="tp-confirm-btn">Confirm Time</button>
            `;

            popup.innerHTML = html;

            // Hour selection
            popup.querySelectorAll('#tp-hours-grid .timepicker-chip').forEach(chip => {
                chip.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selHour = parseInt(chip.getAttribute('data-hour'), 10);
                    renderTimePicker();
                });
            });

            // Minute selection
            popup.querySelectorAll('#tp-minutes-grid .timepicker-chip').forEach(chip => {
                chip.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selMinute = parseInt(chip.getAttribute('data-minute'), 10);
                    renderTimePicker();
                });
            });

            // AM/PM selection
            popup.querySelectorAll('.ampm-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selAmPm = btn.getAttribute('data-ampm');
                    renderTimePicker();
                });
            });

            // Presets
            popup.querySelectorAll('.preset-chip').forEach(chip => {
                chip.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selHour = parseInt(chip.getAttribute('data-h'), 10);
                    selMinute = parseInt(chip.getAttribute('data-m'), 10);
                    selAmPm = chip.getAttribute('data-ampm');
                    renderTimePicker();
                });
            });

            // Confirm
            popup.querySelector('#tp-confirm-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                let hour24 = selHour;
                if (selAmPm === 'AM' && hour24 === 12) hour24 = 0;
                if (selAmPm === 'PM' && hour24 < 12) hour24 += 12;
                const formattedTime = `${String(hour24).padStart(2, '0')}:${String(selMinute).padStart(2, '0')}`;
                targetInput.value = formattedTime;
                targetInput.dispatchEvent(new Event('change', { bubbles: true }));
                closeActivePicker();
            });

            // Clear
            popup.querySelector('#tp-clear-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                targetInput.value = '';
                targetInput.dispatchEvent(new Event('change', { bubbles: true }));
                closeActivePicker();
            });
        }

        renderTimePicker();
        document.body.appendChild(popup);
        activePickerPopup = popup;
        positionPopup(popup, triggerEl);
    }

    // Attach click triggers globally
    function initCustomPickerTriggers() {
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('.custom-picker-trigger');
            if (trigger) {
                const targetId = trigger.getAttribute('data-target');
                const targetType = trigger.getAttribute('data-type');
                const targetInput = document.getElementById(targetId);
                if (targetInput) {
                    if (targetType === 'date') {
                        openCustomDatePicker(targetInput, trigger);
                    } else if (targetType === 'time') {
                        openCustomTimePicker(targetInput, trigger);
                    }
                }
                return;
            }

            // Direct input clicks
            if (e.target.classList.contains('custom-date-input')) {
                openCustomDatePicker(e.target, e.target);
            } else if (e.target.classList.contains('custom-time-input')) {
                openCustomTimePicker(e.target, e.target);
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
    const labelPills = document.querySelectorAll('.label-pill');
    
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
        closeActivePicker();
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
