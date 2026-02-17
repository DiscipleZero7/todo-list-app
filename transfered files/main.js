/*export*/ const projectManager = {
    projects: {
        default: createProject("default"),
    },

    selectedProject: null,

    addProject(title) {
        if (this.projects.hasOwnProperty(title)) {
            alert("Project folder already exists.");
            return;
        }
        this.projects[title] = createProject(title)
    },

    removeProject(title) {
        delete this.projects[title]
    }
}

function createTodo(title, description, dueDate, priority) {
    return { title, description, dueDate, priority, id: crypto.randomUUID() }
}

function createProject(title) {
    return {
        title,
        todos: [],
        
        addTodo(title, description, dueDate, priority) {
            this.todos.push(createTodo(title, description, dueDate, priority))
        },

        removeTodo(id) {
            const index = this.todos.findIndex(e => e.id === id);
            this.todos.splice(index, 1);
        }
    }
}
//***************************//
//******** DOM script *******//
//***************************//

const DOM = {
    container: {
        projects: document.querySelector(".project-list"),
        todos: document.querySelector(".todo-list"),
    },

    button: {
        projectModal: document.querySelector("#project-modal-btn"),
        projectCreate: document.querySelector("#project-create-btn"),
        projectCancel: document.querySelector("#project-cancel-btn"),
        todoModal: document.querySelector("#todo-modal-btn"),
        todoCreate: document.querySelector("#todo-create-btn"),
        todoCancel: document.querySelector("#todo-cancel-btn"),
    },

    modal: {
        project: document.querySelector("#project-modal"),
        todo: document.querySelector("#todo-modal"),
    },

    info: {
        selectedProject: document.querySelector(".selected-project"),
    },

    form: {
        project: document.querySelector("#project-form"),
        todo: document.querySelector("#todo-form"),
    }
}

// Static DOM elements

// Project Form DOM
DOM.button.projectModal.addEventListener("click", () => {
    DOM.modal.project.showModal()
})

DOM.button.projectCancel.addEventListener("click", () => {
    DOM.modal.project.close();
    DOM.form.project.reset();
})

DOM.form.project.addEventListener("submit", () => {
    const newProjectName = document.querySelector("#project-input").value;
    projectManager.addProject(newProjectName);
    DOM.form.project.reset();
    renderFull();
})

//**********
// Todo form
DOM.button.todoModal.addEventListener("click", () => {
    if (projectManager.selectedProject === null) {
        alert("Select a project first.");
        return;
    }
    
    DOM.modal.todo.showModal();
})

DOM.button.todoCancel.addEventListener("click", () => {
    DOM.modal.todo.close();
    DOM.form.todo.reset();
})

DOM.form.todo.addEventListener("submit", () => {
    const todoTitle = document.querySelector("#todo-title-input").value;
    const todoDescription = document.querySelector("#todo-description-input").value;
    const todoDueDate = document.querySelector("#todo-dueDate-input").value;
    const todoPriority = document.querySelector("#todo-priority-input").value;

    projectManager.projects[projectManager.selectedProject].addTodo(todoTitle, todoDescription, todoDueDate, todoPriority)
    renderFull();
    DOM.form.todo.reset();
})
//-------------------------

renderFull();


// DOM functions
function renderProjects() {
    DOM.container.projects.innerHTML = "";

    for (let projectName in projectManager.projects) {
        DOM.container.projects.appendChild(createDOMProjectCards(projectName));
    }
}

function createDOMProjectCards(projectName) {
    const projectCard = document.createElement("div");
    const title = document.createElement("button");
    const deleteBtn = document.createElement("button");

    title.textContent = projectName;
    deleteBtn.textContent = "X";

    deleteBtn.addEventListener("click", () => {
        if (projectName === projectManager.selectedProject) {
            projectManager.selectedProject = null;
        }

        projectManager.removeProject(projectName)
        renderFull();
    })

    title.addEventListener("click", () => {
        projectManager.selectedProject = projectName
        renderFull();
    })

    projectCard.appendChild(title);
    projectCard.appendChild(deleteBtn);

    return projectCard;
}

function renderTodos(projectName) {
    DOM.container.todos.innerHTML = "";

    if (projectManager.selectedProject === null) {
        return;
    }

    for (let i of projectManager.projects[projectName].todos) {
        const todo = i;
        createDOMTodosCards(todo);
    }
}

function createDOMTodosCards(todo) {
    const todoCard = document.createElement("div");

    const todoTitle = document.createElement("p");
    const todoDescription = document.createElement("p");
    const todoDueDate = document.createElement("p");
    const todoPriority = document.createElement("p");
    const todoDelete = document.createElement("button");

    todoTitle.textContent = `Title: ${todo.title}`;
    todoDescription.textContent = `Description: ${todo.description}`;
    todoDueDate.textContent = `Due Date: ${todo.dueDate}`;
    todoPriority.textContent = `Priority: ${todo.priority}`;
    todoDelete.textContent = `Delete todo`;

    todoDelete.addEventListener("click", () => {
        projectManager.projects[projectManager.selectedProject].removeTodo(todo.id)
        renderFull();
    })

    todoCard.appendChild(todoTitle);
    todoCard.appendChild(todoDescription);
    todoCard.appendChild(todoDueDate);
    todoCard.appendChild(todoPriority);
    todoCard.appendChild(todoDelete);

    DOM.container.todos.appendChild(todoCard);
}

//***************//
//  DEV DISPLAY //
//*************//
function DOMSelectedProject() {
    if (projectManager.selectedProject !== null) {
        DOM.info.selectedProject.textContent = projectManager.selectedProject;
    } else {
        DOM.info.selectedProject.textContent = "No Project Selected";
    }
}

function renderFull() {
    renderProjects();
    renderTodos(projectManager.selectedProject);
    DOMSelectedProject();
}

//Experimental branch