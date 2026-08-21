import re

with open('todos/templates/todos/daily.html', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = '''
    const timelineSchedule = document.getElementById('timeline-schedule');
    const hours = [
        "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
        "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
        "06:00 PM", "07:00 PM", "08:00 PM"
    ];

    let backendTodos = [];

    async function fetchDailyTodos() {
        try {
            const res = await fetch('/api/todos/');
            if (res.ok) {
                const todos = await res.json();
                // Filter for today's tasks
                const todayStr = new Date().toISOString().split('T')[0];
                backendTodos = todos.filter(t => t.due_date === todayStr);
                renderSchedule();
            }
        } catch (e) {
            console.error(e);
        }
    }

    function formatTime24(time12) {
        // time12 = "08:00 AM"
        const [time, modifier] = time12.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') hours = '00';
        if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
        return \\:\\;
    }

    function renderSchedule() {
        if (!timelineSchedule) return;
        timelineSchedule.innerHTML = '';

        hours.forEach(hour => {
            // Find a task that has a due_time matching this hour
            const hour24 = formatTime24(hour);
            const task = backendTodos.find(t => t.due_time && t.due_time.startsWith(hour24));
            
            const hasTask = !!task;
            const contentText = hasTask ? task.title : 'Double-click to set block...';
            
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.innerHTML = \
                <div class="time-label">\</div>
                <div class="time-slot-content \" data-hour="\" data-hour24="\">
                    \
                </div>
            \;
            timelineSchedule.appendChild(slot);
        });

        // Add listeners for editing timeblocks
        document.querySelectorAll('.time-slot-content').forEach(element => {
            element.addEventListener('dblclick', () => {
                const hour24 = element.getAttribute('data-hour24');
                const todayStr = new Date().toISOString().split('T')[0];
                window.dispatchEvent(new CustomEvent('openTaskModal', {
                    detail: {
                        title: 'Schedule Timeblock',
                        dueDate: todayStr,
                        dueTime: hour24
                    }
                }));
            });
        });
    }

    // Initial fetch
    fetchDailyTodos();
    
    // Listen for modal saves
    window.addEventListener('todoSaved', fetchDailyTodos);
'''

# Find the section to replace
# We need to replace from const timelineSchedule = ... up to enderSchedule();
pattern = r"const timelineSchedule = document.getElementById\('timeline-schedule'\);.*?renderSchedule\(\);"
content = re.sub(pattern, replacement.strip(), content, flags=re.DOTALL)

with open('todos/templates/todos/daily.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
