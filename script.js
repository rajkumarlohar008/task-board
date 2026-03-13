const todo = document.querySelector("#to-do");
const inProgress = document.querySelector("#in-progress");
const done = document.querySelector("#done");
const columns = [todo, inProgress, done];
const toggleBtn = document.querySelector("#toggle-modal");
const addBtn = document.querySelector("#add-new-task");
const modal = document.querySelector(".modal");
const modalBg = document.querySelector(".modal .bg");
const titleInput = document.querySelector("#title");
const descriptionInput = document.querySelector("#Discreption");

let draggedElement = null;

const trackElement = (dets) => {
    draggedElement = dets.target.closest('.task');
};

const tasks = document.querySelectorAll(".task");
tasks.forEach(task => {
    task.addEventListener("dragstart", trackElement);
});

const addEventListeners = (column) => {
    column.addEventListener("dragenter", (dets) => {
        dets.preventDefault();
        column.classList.add("hover-over");
    });

    column.addEventListener("dragleave", (dets) => {
        dets.preventDefault();
        column.classList.remove("hover-over");
    });

    column.addEventListener("dragover", (dets) => {
        dets.preventDefault();
    });

    column.addEventListener("drop", (dets) => {
        column.appendChild(draggedElement);
        column.classList.remove("hover-over");
        updateAllCounts();
        saveTasksToLocalStorage();
    });

    // Event delegation for delete buttons
    column.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON") {
            deleteEvent(e);
        }
    });
};

columns.forEach(column => {
    addEventListeners(column);
});

toggleBtn.addEventListener("click", () => {
    modal.classList.toggle("active");
});

modalBg.addEventListener("click", () => {
    modal.classList.remove("active");
});

const STORAGE_KEY = "kanbanTasks";

// const generateId = () => {
//     if (window.crypto?.randomUUID) return crypto.randomUUID();
//     return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
// };

const createTaskElement = ({ title, description }) => {
    const task = document.createElement("div");
    task.className = "task";
    task.setAttribute("draggable", "true");

    const titleEl = document.createElement("h2");
    titleEl.textContent = title;

    const descriptionEl = document.createElement("p");
    descriptionEl.textContent = description;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";

    task.appendChild(titleEl);
    task.appendChild(descriptionEl);
    task.appendChild(deleteBtn);
    task.addEventListener("dragstart", trackElement);

    return task;
};

const clearTasksFromColumn = (col) => {
    col.querySelectorAll('.task').forEach(task => task.remove());
};

const getTasksData = () => {
    const data = { todo: [], inProgress: [], done: [] };
    const map = {
        "to-do": "todo",
        "in-progress": "inProgress",
        "done": "done",
    };

    columns.forEach(col => {
        const key = map[col.id];
        if (!key) return;
        col.querySelectorAll('.task').forEach(task => {
            const title = task.querySelector('h2')?.textContent || '';
            const description = task.querySelector('p')?.textContent || '';
            data[key].push({ title, description });
        });
    });

    return data;
};

const saveTasksToLocalStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getTasksData()));
};

const loadTasksFromLocalStorage = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        saveTasksToLocalStorage();
        return;
    }

    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return;
    }

    if (!parsed || typeof parsed !== 'object') return;

    columns.forEach(clearTasksFromColumn);

    const addTasks = (key, col) => {
        const items = Array.isArray(parsed[key]) ? parsed[key] : [];
        items.forEach(taskData => col.appendChild(createTaskElement(taskData)));
    };

    addTasks('todo', todo);
    addTasks('inProgress', inProgress);
    addTasks('done', done);
};

const updateCount = (col) => {
    const countEl = col.querySelector('.right');
    countEl.textContent = col.querySelectorAll('.task').length;
};

const updateAllCounts = () => {
    columns.forEach(col => updateCount(col));
};

loadTasksFromLocalStorage();
updateAllCounts();

addBtn.addEventListener("click", (dets) => {
    dets.preventDefault();
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!title) return; // Prevent adding empty tasks

    const task = createTaskElement({ title, description });

    todo.appendChild(task);
    modal.classList.remove("active");
    titleInput.value = '';
    descriptionInput.value = '';
    updateCount(todo);
    saveTasksToLocalStorage();
});

const deleteEvent = (dets) => {
    const task = dets.target.parentElement;
    const column = task.parentElement;
    column.removeChild(task);
    updateCount(column);
    saveTasksToLocalStorage();
};