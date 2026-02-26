import "./styles.css";
import folder from "./icons/folder.svg";
import pencil from "./icons/pencil.svg";
import checkmark from "./icons/check-bold.svg";

//Date-fns testing//
import { addDays, format, isPast } from "date-fns";
const date = new Date();
//console.log(format(date, "ccc, LLL d, k:mm a"))
//////////

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

function createTodo(title, description, dueDate, priority, time) {
    return { title, description, dueDate, priority, id: crypto.randomUUID(), time }
}

function createProject(title) {
    return {
        title,
        todos: [],
        completed: [],
        selectedTab: "upcoming",
        selectedTodo: null,
        
        addTodo(title, description, dueDate, priority, time) {
            this.todos.push(createTodo(title, description, dueDate, priority, time))
        },

        removeTodo(id) {
            const index = this.todos.findIndex(e => e.id === id);
            this.todos.splice(index, 1);
        },

        completeTodo(id) {
            const index = this.todos.findIndex(e => e.id === id);
            this.todos[index].timeCompleted = format(new Date(Date.now()), "ccc, LLL d, h:mm a");
            this.completed.push(this.todos.splice(index, 1)[0]);
        },

        editTodo(id, newTitle, newDescription, newPriority, newTime, newDate) {
            const index = this.todos.findIndex(e => e.id === id);
            this.todos[index].title = newTitle;
            this.todos[index].description = newDescription;
            this.todos[index].priority = newPriority;
            this.todos[index].time = newTime;

            if (newTime === "") {
            this.todos[index].dueDate = new Date(newDate)
            } else {
                this.todos[index].dueDate = new Date(newDate+"T"+newTime)
            }
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
        editCancel: document.querySelector("#edit-cancel-btn"),
        filterUpcoming: document.querySelector("#upcoming-btn"),
        filterOverdue: document.querySelector("#overdue-btn"),
        filterCompleted: document.querySelector("#completed-btn"),
    },

    modal: {
        project: document.querySelector("#project-modal"),
        todo: document.querySelector("#todo-modal"),
        edit: document.querySelector("#edit-modal"),
    },

    info: {
        selectedProject: document.querySelector(".selected-project"),
    },

    form: {
        project: document.querySelector("#project-form"),
        todo: document.querySelector("#todo-form"),
        edit: document.querySelector("#edit-form"),
    }
}

// Static DOM elements
DOM.button.filterUpcoming.addEventListener("click", () => {
    if (projectManager.selectedProject !== null) {
        if (document.querySelector(".filter-btn.selected")) {
            document.querySelector(".filter-btn.selected").classList.remove("selected");
        }

        DOM.button.filterUpcoming.classList.add("selected");
    } else {
        return;
    }
})

DOM.button.filterOverdue.addEventListener("click", () => {
    if (projectManager.selectedProject !== null) {
        if (document.querySelector(".filter-btn.selected")) {
            document.querySelector(".filter-btn.selected").classList.remove("selected");
        }

        DOM.button.filterOverdue.classList.add("selected");
    } else {
        return;
    }
})

DOM.button.filterCompleted.addEventListener("click", () => {
    if (projectManager.selectedProject !== null) {
        if (document.querySelector(".filter-btn.selected")) {
            document.querySelector(".filter-btn.selected").classList.remove("selected");
        }

        DOM.button.filterCompleted.classList.add("selected");
    } else {
        return;
    }
})

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
    //Due Date to object
    const todoDueDate = document.querySelector("#todo-dueDate-input").value;
    const todoDueTime = document.querySelector("#todo-time-input").value;
    let finalDate;
    if (todoDueTime === "") {
        finalDate = new Date(todoDueDate);
        finalDate.setMinutes(finalDate.getTimezoneOffset());
        console.log(projectManager)
    } else {
        finalDate = new Date(todoDueDate+"T"+todoDueTime)
    }
    ////////////////
    const todoPriority = document.querySelector("#todo-priority-input").value;

    projectManager.projects[projectManager.selectedProject].addTodo(todoTitle, todoDescription, finalDate, todoPriority, todoDueTime)
    renderUpcoming(projectManager.selectedProject);
    DOM.form.todo.reset();
})

// Edit form NEED TO REFACTOR BIG TIME!!
DOM.form.edit.addEventListener("submit", () => {
    projectManager.projects[projectManager.selectedProject].editTodo(projectManager.projects[projectManager.selectedProject].selectedTodo, 
        document.querySelector("#edit-title-input").value,
        document.querySelector("#edit-description-input").value,
        document.querySelector("#edit-priority-input").value,
        document.querySelector("#edit-time-input").value,
        document.querySelector("#edit-dueDate-input").value,)
    renderFull();
})

DOM.button.editCancel.addEventListener("click", () => {
    DOM.modal.edit.close();
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
    const projectCard = document.createElement("li");
    projectCard.classList.add("project-list-item");

    const image = document.createElement("img");
    image.classList.add("project-img");
    image.src = folder;

    const title = document.createElement("span");
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

    projectCard.addEventListener("click", () => {
        projectManager.selectedProject = projectName;

        if (document.querySelector(".project-list-item.selected")) {
            document.querySelector(".project-list-item.selected").classList.remove("selected")
        }

        projectCard.classList.add("selected");

        if (document.querySelector(".filter-btn.selected")) {
            document.querySelector(".filter-btn.selected").classList.remove("selected");
        }

        DOM.button.filterUpcoming.classList.add("selected");
        
        renderUpcoming(projectManager.selectedProject);
    }, true)

    projectCard.appendChild(image);
    projectCard.appendChild(title);
    projectCard.appendChild(deleteBtn);

    return projectCard;
}

function renderUpcoming(projectName) {
    DOM.container.todos.innerHTML = "";

    if (projectManager.selectedProject === null) {
        return;
    }
    
    for (let i of projectManager.projects[projectName].todos) {
        const todo = i;

        if (!isPast(todo.dueDate)) {
            createDOMTodosCards(todo);
        }
    }
}

function renderCompleted(projectName) {
    DOM.container.todos.innerHTML = "";

    if (projectManager.selectedProject === null) {
        return;
    }
    
    for (let i of projectManager.projects[projectName].completed) {
        const todo = i;
        createDOMCompletedCards(todo);
    }
}

function renderOverdue(projectName) {
    DOM.container.todos.innerHTML = "";
    
    if (projectManager.selectedProject === null) {
        return;
    }
    
    for (let i of projectManager.projects[projectName].todos) {
        const todo = i;

        if (isPast(todo.dueDate)) {
            createDOMTodosCards(todo);
        }
    }
}

function createDOMTodosCards(todo) {
    const todoCard = document.createElement("div");

    const todoComplete = document.createElement("button");
    const todoTitle = document.createElement("span");
    const todoDescription = document.createElement("span");
    const todoDueDate = document.createElement("span");
    const todoPriority = document.createElement("span");
    const todoDelete = document.createElement("button");
    const todoEdit = document.createElement("button");

    todoTitle.textContent = `${todo.title}`;
    todoDescription.textContent = `${todo.description}`;

    //todoDueDate.textContent = `Due: ${todo.dueDate}`;
    if (todo.time === "") {
        todoDueDate.textContent = format(todo.dueDate, "ccc, LLL d");
    } else {
        todoDueDate.textContent = format(todo.dueDate, "ccc, LLL d, h:mm a");
    }
       

    todoPriority.textContent = `${todo.priority}`;
    todoDelete.textContent = `X`;

    todoCard.classList.add("todo-card");
    todoPriority.classList.add("todo-priority")
    todoDelete.classList.add("todo-delete");
    todoEdit.classList.add("todo-edit")
    todoComplete.classList.add("todo-complete");

    switch (todo.priority) {
        case "1":
            todoPriority.classList.add("one");
            break;
        case "2":
            todoPriority.classList.add("two");
            break;
        case "3":
            todoPriority.classList.add("three");
            break;
        case "4":
            todoPriority.classList.add("four");
    }

    todoComplete.addEventListener("click", () => {
        projectManager.projects[projectManager.selectedProject].completeTodo(todo.id)
        renderFull();
    })

    todoEdit.addEventListener("click", () => {
        document.querySelector("#edit-title-input").value = todo.title;
        document.querySelector("#edit-dueDate-input").value = format(todo.dueDate, "yyyy-MM-dd");
        document.querySelector("#edit-time-input").value = todo.time;
        document.querySelector("#edit-priority-input").value = todo.priority;
        document.querySelector("#edit-description-input").value = todo.description;

        projectManager.projects[projectManager.selectedProject].selectedTodo = todo.id;
        DOM.modal.edit.showModal();
    })

    todoDelete.addEventListener("click", () => {
        projectManager.projects[projectManager.selectedProject].removeTodo(todo.id)
        renderFull();
    })

    todoCard.appendChild(todoComplete);
    todoCard.appendChild(todoTitle);
    //todoCard.appendChild(todoDescription);
    todoCard.appendChild(todoDueDate);
    todoCard.appendChild(todoPriority);
    todoCard.appendChild(todoDelete);
    todoCard.appendChild(todoEdit);

    DOM.container.todos.appendChild(todoCard);
}

function createDOMCompletedCards(todo) {
    const todoCard = document.createElement("div");

    const todoTitle = document.createElement("span");
    const todoCompletedDate = document.createElement("span");

    todoTitle.textContent = `${todo.title}`;
    todoCompletedDate.textContent = `Completed on: ${todo.timeCompleted}`;
       
    todoCard.classList.add("todo-card");

    todoCard.appendChild(todoTitle);
    todoCard.appendChild(todoCompletedDate);

    DOM.container.todos.appendChild(todoCard);
}
//***************//
//  DEV DISPLAY //
//*************//

function renderFull() {
    renderProjects();
    renderUpcoming(projectManager.selectedProject);
}


function renderCurrentTab(tab) {
    switch (tab) {
        case "upcoming":
            renderUpcoming(projectManager.selectedProject);
            break;
        
        case "overdue":
            renderOverdue(projectManager.selectedProject);
            break;

        case "completed": 
            renderCompleted(projectManager.selectedProject);
    }
}


const completedBtn = document.querySelector("#completed-btn");
const upcomingBtn = document.querySelector("#upcoming-btn");
const overdueBtn = document.querySelector("#overdue-btn");

completedBtn.addEventListener("click", () => {
    if (projectManager.selectedProject === null) {
        alert("SELECT A PROJECT FOO!");
        return;
    }
    projectManager.projects[projectManager.selectedProject].selectedTab = "completed";
    renderCurrentTab(projectManager.projects[projectManager.selectedProject].selectedTab)
})

upcomingBtn.addEventListener("click", () => {
    if (projectManager.selectedProject === null) {
        alert("SELECT A PROJECT FOO!");
        return;
    }
    projectManager.projects[projectManager.selectedProject].selectedTab = "upcoming";
    renderCurrentTab(projectManager.projects[projectManager.selectedProject].selectedTab)
})

overdueBtn.addEventListener("click", () => {
    if (projectManager.selectedProject === null) {
        alert("SELECT A PROJECT FOO!");
        return;
    }
    projectManager.projects[projectManager.selectedProject].selectedTab = "overdue";
    renderCurrentTab(projectManager.projects[projectManager.selectedProject].selectedTab)
})

//Experimental branch 2