document.addEventListener('DOMContentLoaded', () => {
    const newProjectInput = document.getElementById('newProjectInput');
    const createProjectBtn = document.getElementById('createProjectBtn');
    const projectsContainer = document.getElementById('projectsContainer');
    const optionsList = document.querySelector('.options-list');
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('confirmAddTask');
    const tasksList = document.getElementById('tasksList');
    const customSelect = document.getElementById('customSelect');
    const trigger = customSelect.querySelector('.select-trigger');
    const selectedText = document.getElementById('selectedOption');
    
    const schedulePanel = document.getElementById('schedulePanel');
    const panelDateTitle = document.getElementById('panelDateTitle');
    const timeGrid = document.querySelector('.time-grid');

    let projects = JSON.parse(localStorage.getItem('projects')) || [
        { id: 'web-dev', name: 'Desenvolvimento Web', color: '#6c4ab6' },
        { id: 'mobile-design', name: 'Design App Mobile', color: '#6ec1c7' }
    ]; 

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentProject = projects.length > 0 ? projects[0].id : null;
    let selectedDate = null;
    let date = new Date();

    const colorPalette = ['#1173a0', '#46772a', '#fabc35', '#df6e3a', '#ca2424', '#ce38ce', '#a3c03a', '#1cc089', '#7a1818', '#ebd830'];

    function saveAll() {
        localStorage.setItem('projects', JSON.stringify(projects));
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function updateProjectProgress() {
        projects.forEach(proj => {
            const projectTasks = tasks.filter(t => t.project === proj.id);
            const total = projectTasks.length;
            const completed = projectTasks.filter(t => t.completed).length;
            const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

            const card = document.getElementById(proj.id);
            if (card) {
                const textEl = card.querySelector('.progress-text');
                const barEl = card.querySelector('.progress-bar');
                if(textEl) textEl.textContent = `${completed} de ${total} tarefas`;
                if(barEl) barEl.style.width = `${percent}%`;
            }
        });
    }

    function renderProjects() {
        if (!projectsContainer) return;
        projectsContainer.innerHTML = '';
        optionsList.innerHTML = '';

        projects.forEach(proj => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.id = proj.id;
            card.style.backgroundColor = proj.color;

            card.innerHTML = `
                <div class="project-actions">
                    <button class="proj-btn edit-proj"><span class="material-icons">edit</span></button>
                    <button class="proj-btn delete-proj"><span class="material-icons">delete</span></button>
                </div>
                <h3 contenteditable="false" spellcheck="false">${proj.name}</h3>
                <p class="progress-text">0 de 0 tarefas</p>
                <div class="progress-track"><div class="progress-bar"></div></div>
            `;

            const titleTag = card.querySelector('h3');
            const editBtn = card.querySelector('.edit-proj');

            editBtn.onclick = (e) => {
                e.stopPropagation();
                const isEditing = titleTag.getAttribute('contenteditable') === 'true';
                if (!isEditing) {
                    titleTag.setAttribute('contenteditable', 'true');
                    titleTag.focus();
                    editBtn.querySelector('.material-icons').textContent = 'done';
                } else {
                    titleTag.setAttribute('contenteditable', 'false');
                    proj.name = titleTag.textContent.trim();
                    editBtn.querySelector('.material-icons').textContent = 'edit';
                    saveAll();
                    renderProjects();
                }
            };

            card.querySelector('.delete-proj').onclick = (e) => {
                e.stopPropagation();
                if(confirm('Excluir projeto?')) {
                    projects = projects.filter(p => p.id !== proj.id);
                    tasks = tasks.filter(t => t.project !== proj.id);
                    saveAll();
                    renderProjects();
                }
            };

            projectsContainer.appendChild(card);
            
            const li = document.createElement('li');
            li.textContent = proj.name;
            li.onclick = (e) => {
                e.stopPropagation();
                selectedText.textContent = proj.name;
                currentProject = proj.id;
                customSelect.classList.remove('active');
            };
            optionsList.appendChild(li);
        });

        updateProjectProgress();
    }

    function createTask(taskData) {
        const { id, text, completed } = taskData;
        const task = document.createElement('div');
        task.classList.add('task');

        task.innerHTML = `
            <div class="checkbox-wrapper">
                <label class="checkbox-container">
                    <input type="checkbox" ${completed ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </label>
            </div>
            <span class="task-text ${completed ? 'completed' : ''}" spellcheck="false">${text}</span>
            <div class="task-actions">
                <button class="edit-btn"><span class="material-icons">edit</span></button>
                <button class="delete-btn"><span class="material-icons">delete</span></button>
            </div>
        `;

        const checkbox = task.querySelector('input[type="checkbox"]');
        const taskText = task.querySelector('.task-text');
        
        checkbox.onchange = () => {
            const taskObj = tasks.find(t => t.id === id);
            if (taskObj) {
                taskObj.completed = checkbox.checked;
                taskText.classList.toggle('completed', checkbox.checked);
                saveAll();
                updateProjectProgress();
            }
        };

        task.querySelector('.delete-btn').onclick = () => {
            tasks = tasks.filter(t => t.id !== id);
            saveAll();
            task.remove();
            updateProjectProgress();
        };

        tasksList.appendChild(task);
    }

    function renderCalendar() {
        const monthYear = document.getElementById('monthYear');
        const calendarDays = document.getElementById('calendarDays');
        if (!monthYear || !calendarDays) return;

        const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        monthYear.innerHTML = `${months[date.getMonth()]} ${date.getFullYear()}`;
        
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        const prevLastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
        const firstDayIndex = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        const nextDays = 7 - new Date(date.getFullYear(), date.getMonth() + 1, 0).getDay() - 1;

        let days = "";

        for (let x = firstDayIndex; x > 0; x--) {
            days += `<div class="day other-month">${prevLastDay - x + 1}</div>`;
        }

        for (let i = 1; i <= lastDay; i++) {
            const isToday = i === new Date().getDate() && date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear();
            days += `<div class="day ${isToday ? 'today' : ''}">${i}</div>`;
        }

        for (let j = 1; j <= nextDays; j++) {
            days += `<div class="day other-month">${j}</div>`;
        }

        calendarDays.innerHTML = days;

        calendarDays.querySelectorAll('.day:not(.other-month)').forEach(dayEl => {
            dayEl.onclick = () => {
                calendarDays.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
                dayEl.classList.add('selected');
                selectedDate = new Date(date.getFullYear(), date.getMonth(), parseInt(dayEl.textContent));
                openSchedulePanel(selectedDate);
            };
        });
    }

    function openSchedulePanel(data) {
        panelDateTitle.textContent = data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
        timeGrid.innerHTML = '';
        const dateISO = data.toISOString().split('T')[0];

        for (let h = 0; h < 24; h++) {
            const timeStr = `${h.toString().padStart(2, '0')}:00`;
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            
            const existingTask = tasks.find(t => t.date && t.date.startsWith(dateISO) && t.text.includes(timeStr));

            slot.innerHTML = `
                <span class="time-label">${timeStr}</span>
                <input type="text" class="slot-input" placeholder="Adicionar tarefa..." 
                       value="${existingTask ? existingTask.text.split(' - ')[0] : ''}" data-time="${timeStr}">
            `;

            slot.querySelector('input').onchange = (e) => {
                if (e.target.value.trim() !== "") {
                    const newTask = {
                        id: Date.now(),
                        text: `${e.target.value} - 🕒 ${timeStr}`,
                        completed: false,
                        project: currentProject,
                        date: data.toISOString()
                    };
                    tasks.push(newTask);
                    saveAll();
                    createTask(newTask);
                    updateProjectProgress();
                }
            };
            timeGrid.appendChild(slot);
        }
        schedulePanel.classList.add('active');
    }

    document.getElementById('closePanel').onclick = () => {
        schedulePanel.classList.remove('active');
    };

    document.getElementById('prevMonth').onclick = () => {
        date.setMonth(date.getMonth() - 1);
        renderCalendar();
    };

    document.getElementById('nextMonth').onclick = () => {
        date.setMonth(date.getMonth() + 1);
        renderCalendar();
    };

    createProjectBtn.onclick = () => {
        const name = newProjectInput.value.trim();
        if (name && projects.length < 10) {
            const id = 'proj-' + Date.now();
            const color = colorPalette[projects.length % colorPalette.length];
            projects.push({ id, name, color });
            saveAll();
            renderProjects();
            newProjectInput.value = '';
        }
    };

    trigger.onclick = (e) => {
        e.stopPropagation();
        customSelect.classList.toggle('active');
    };

    window.onclick = () => customSelect.classList.remove('active');

    addTaskBtn.onclick = () => {
        const text = taskInput.value.trim();
        if (text && currentProject) {
            const newTask = { id: Date.now(), text, completed: false, project: currentProject };
            tasks.push(newTask);
            saveAll();
            createTask(newTask);
            updateProjectProgress();
            taskInput.value = '';
        }
    };

    function init() {
        renderProjects();
        tasks.forEach(t => createTask(t));
        if (projects.length > 0) {
            selectedText.textContent = projects[0].name;
            currentProject = projects[0].id;
        }
        renderCalendar();
    }

    init();
});