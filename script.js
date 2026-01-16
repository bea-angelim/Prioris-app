document.addEventListener('DOMContentLoaded', () => {
    const newProjectInput = document.getElementById('newProjectInput');
    const createProjectBtn = document.getElementById('createProjectBtn');
    const projectsContainer = document.querySelector('.projects');
    const optionsList = document.querySelector('.options-list');
    
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('confirmAddTask');
    const tasksList = document.getElementById('tasksList');
    
    const customSelect = document.getElementById('customSelect');
    const trigger = customSelect.querySelector('.select-trigger');
    const selectedText = document.getElementById('selectedOption');

    let projects = JSON.parse(localStorage.getItem('projects')) || [
        { id: 'web-dev', name: 'Desenvolvimento Web', color: '#6c4ab6' },
        { id: 'mobile-design', name: 'Design App Mobile', color: '#6ec1c7' }
    ]; 

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentProject = projects.length > 0 ? projects[0].id : null;

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
                card.querySelector('.progress-text').textContent = `${completed} de ${total} tarefas`;
                card.querySelector('.progress-bar').style.width = `${percent}%`;
            }
        });
    }

    function renderProjects() {
    const projectsContainer = document.getElementById('projectsContainer');
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

        editBtn.addEventListener('click', (e) => {
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
        });

        card.querySelector('.delete-proj').addEventListener('click', (e) => {
            e.stopPropagation();
            if(confirm('Excluir projeto?')) {
                projects = projects.filter(p => p.id !== proj.id);
                tasks = tasks.filter(t => t.project !== proj.id);
                saveAll();
                renderProjects();
            }
        });

        projectsContainer.appendChild(card);
        
        // Renderiza lista do select
        const li = document.createElement('li');
        li.dataset.value = proj.id;
        li.textContent = proj.name;
        li.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedText.textContent = proj.name;
            currentProject = proj.id;
            customSelect.classList.remove('active');
        });
        optionsList.appendChild(li);
    });

    updateProjectProgress();
}

    function createTask(taskData) {
        const { id, text, completed, project } = taskData;
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
        const editBtn = task.querySelector('.edit-btn');

        checkbox.addEventListener('change', () => {
            const taskObj = tasks.find(t => t.id === id);
            if (taskObj) {
                taskObj.completed = checkbox.checked;
                taskText.classList.toggle('completed', checkbox.checked);
                saveAll();
                updateProjectProgress();
            }
        });

        editBtn.addEventListener('click', () => {
            const isEditing = taskText.classList.contains('editing');

            if (!isEditing) {
                taskText.contentEditable = true;
                taskText.classList.add('editing');
                editBtn.querySelector('.material-icons').textContent = 'check';
                taskText.focus();
            } else {
                taskText.contentEditable = false;
                taskText.classList.remove('editing');
                editBtn.querySelector('.material-icons').textContent = 'edit';
                const taskObj = tasks.find(t => t.id === id);
                if (taskObj) {
                    taskObj.text = taskText.textContent.trim();
                    saveAll();
                }
            }
        });

        task.querySelector('.delete-btn').addEventListener('click', () => {
            tasks = tasks.filter(t => t.id !== id);
            saveAll();
            task.remove();
            updateProjectProgress();
        });

        tasksList.appendChild(task);
    }

    createProjectBtn.addEventListener('click', () => {
        const name = newProjectInput.value.trim();
        if (projects.length >= 10) return alert("Limite de 10 atingido!");
        
        if (name) {
            const id = 'proj-' + Date.now();
            const color = colorPalette[projects.length % colorPalette.length];
            projects.push({ id, name, color });
            saveAll();
            renderProjects();
            newProjectInput.value = '';
        }
    });

    newProjectInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') createProjectBtn.click();
    });

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        customSelect.classList.toggle('active');
    });

    window.addEventListener('click', () => {
        customSelect.classList.remove('active');
    });

    addTaskBtn.addEventListener('click', () => {
        const text = taskInput.value.trim();
        if (!text || !currentProject) return;

        const newTask = { id: Date.now(), text, completed: false, project: currentProject };
        tasks.push(newTask);
        saveAll();
        createTask(newTask);
        updateProjectProgress();
        taskInput.value = '';
    });

    function init() {
        renderProjects();
        tasks.forEach(t => createTask(t));
        if (projects.length > 0) {
            selectedText.textContent = projects[0].name;
            currentProject = projects[0].id;
        }
    }

    init();

    const slider = document.getElementById('projectsContainer');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (nextBtn && prevBtn && slider) {
        nextBtn.addEventListener('click', () => {
            slider.scrollBy({ left: 300, behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', () => {
            slider.scrollBy({ left: -300, behavior: 'smooth' });
        });

        slider.addEventListener('scroll', () => {
            const maxScroll = slider.scrollWidth - slider.clientWidth;
            
            prevBtn.style.opacity = slider.scrollLeft <= 5 ? "0" : "1";
            prevBtn.style.pointerEvents = slider.scrollLeft <= 5 ? "none" : "auto";

            nextBtn.style.opacity = slider.scrollLeft >= maxScroll - 5 ? "0" : "1";
            nextBtn.style.pointerEvents = slider.scrollLeft >= maxScroll - 5 ? "none" : "auto";
        });
    }

    let date = new Date();

    function renderCalendar() {
        const monthYear = document.getElementById('monthYear');
        const calendarDays = document.getElementById('calendarDays');
        
        if (!monthYear || !calendarDays) return;

        const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        
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
            const isToday = i === new Date().getDate() && date.getMonth() === new Date().getMonth();
            const hasEvent = (i === 9 || i === 16); 
            
            let className = "day";
            if (isToday) className += " today";
            if (hasEvent) className += " has-event";
            
            days += `<div class="${className}">${i}</div>`;
        }

        for (let j = 1; j <= nextDays; j++) {
            days += `<div class="day other-month">${j}</div>`;
        }
        
        calendarDays.innerHTML = days;
    }

    document.getElementById('prevMonth').addEventListener('click', () => {
        date.setMonth(date.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        date.setMonth(date.getMonth() + 1);
        renderCalendar();
    });

    renderCalendar();
});