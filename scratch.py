import re

with open('todos/static/todos/js/dashboard.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add listener for todoSaved
content = content.replace("fetchTodos();", "fetchTodos();\n    window.addEventListener('todoSaved', fetchTodos);")

# 2. Update formToggleBtn logic to dispatch an event to open modal instead of opening it directly
toggle_logic = '''
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
'''
content = re.sub(r'if \(formToggleBtn\) \{.*?\}\);.*?\}', toggle_logic.strip(), content, flags=re.DOTALL)

with open('todos/static/todos/js/dashboard.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
