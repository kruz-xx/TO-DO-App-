document.addEventListener('DOMContentLoaded', () => {
    // Sidebar toggle functionality
    const sidebarToggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('app-sidebar');

    // Create overlay for click-outside-to-close on mobile
    const overlay = document.createElement('div');
    overlay.id = 'sidebar-overlay';
    overlay.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.3);
        z-index: 998; display: none; backdrop-filter: blur(2px);
    `;
    document.body.appendChild(overlay);

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.style.display = 'block';
        sidebarToggleBtn.setAttribute('aria-expanded', 'true');
        // Animate hamburger → X
        sidebarToggleBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>`;
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.style.display = 'none';
        sidebarToggleBtn.setAttribute('aria-expanded', 'false');
        // Animate X → hamburger
        sidebarToggleBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>`;
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

    // Theme Switcher functionality
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const darkIcon = document.querySelector('.theme-icon-dark');
    const lightIcon = document.querySelector('.theme-icon-light');

    // Load theme from localStorage or default to system
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
});


// --- GLOBAL TASK MODAL LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
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
            if(pill.classList.contains('active')) {
                pill.style.boxShadow = '0 0 0 2px white, 0 0 0 4px ' + getComputedStyle(pill).backgroundColor;
            } else {
                pill.style.boxShadow = 'none';
            }
        });
    });

    function getSelectedLabels() {
        let labels = [];
        labelPills.forEach(pill => {
            if(pill.classList.contains('active')) {
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
