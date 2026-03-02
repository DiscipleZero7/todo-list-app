import "./styles.css";
import folder from "./icons/folder.svg";
import pencil from "./icons/pencil.svg";
import checkmark from "./icons/check-bold.svg";
import clock from "./icons/clock-alert.svg";
import note from "./icons/note-edit.svg";

//Date-fns testing//
import { addDays, format, isPast } from "date-fns";
const date = new Date();
//console.log(format(date, "ccc, LLL d, k:mm a"))
//////////


let projectStorage = localStorage.getItem("projects");
if (projectStorage === null) {
    projectStorage = {default: createProject("default")};
} else {
    projectStorage = JSON.parse(localStorage.getItem("projects"))
}

/*export*/ const projectManager = {
    projects: projectStorage,

    selectedProject: null,

    addProject(title) {
        if (this.projects.hasOwnProperty(title)) {
            alert("Project folder already exists.");
            return;
        }
        this.projects[title] = createProject(title)
        localStorage.setItem("projects", JSON.stringify(projectManager.projects));
    },

    removeProject(title) {
        delete this.projects[title];
        localStorage.setItem("projects", JSON.stringify(projectManager.projects));
    },

    addTodo(title, description, dueDate, priority, time) {
            this.projects[this.selectedProject].todos.push(createTodo(title, description, dueDate, priority, time));
            localStorage.setItem("projects", JSON.stringify(projectManager.projects));
        },

    removeTodo(id) {
        const index = this.projects[this.selectedProject].todos.findIndex(e => e.id === id);
        this.projects[this.selectedProject].todos.splice(index, 1);
        localStorage.setItem("projects", JSON.stringify(projectManager.projects));
    },

    completeTodo(id) {
        const index = this.projects[this.selectedProject].todos.findIndex(e => e.id === id);
        this.projects[this.selectedProject].todos[index].timeCompleted = format(new Date(Date.now()), "ccc, LLL d, h:mm a");
        this.projects[this.selectedProject].completed.push(this.projects[this.selectedProject].todos.splice(index, 1)[0]);
        localStorage.setItem("projects", JSON.stringify(projectManager.projects));
    },

    editTodo(id, newTitle, newDescription, newPriority, newTime, newDate) {
        const index = this.projects[this.selectedProject].todos.findIndex(e => e.id === id);
        this.projects[this.selectedProject].todos[index].title = newTitle;
        this.projects[this.selectedProject].todos[index].description = newDescription;
        this.projects[this.selectedProject].todos[index].priority = newPriority;
        this.projects[this.selectedProject].todos[index].time = newTime;

        if (newTime === "") {
        let finalDate = new Date(newDate);
        finalDate.setMinutes(finalDate.getTimezoneOffset());
        finalDate.setHours(23, 59);
        this.projects[this.selectedProject].todos[index].dueDate = finalDate
        } else {
            this.projects[this.selectedProject].todos[index].dueDate = new Date(newDate+"T"+newTime)
        }

        localStorage.setItem("projects", JSON.stringify(projectManager.projects));
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
    }
}
//***************************//
//******** DOM script *******//
//***************************//

const DOM = {
    container: {
        projects: document.querySelector(".project-list"),
        todos: document.querySelector(".todo-list"),
        noProject: document.querySelector(".no-project-container"),
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
    projectManager.selectedTab = "upcoming";
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
    projectManager.selectedTab = "overdue";
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
    projectManager.selectedTab = "completed";
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
    projectManager.selectedProject = newProjectName;
    projectManager.selectedTab = "upcoming";
    document.querySelector(".filter-btn.selected")?.classList.remove("selected");
    document.querySelector("#upcoming-btn").classList.add("selected");
    renderProjects();
    renderCurrentTab(projectManager.selectedTab);
    
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
        finalDate.setHours(23, 59);
    } else {
        finalDate = new Date(todoDueDate+"T"+todoDueTime)
    }
    ////////////////
    const todoPriority = document.querySelector("#todo-priority-input").value;

    //projectManager.projects[projectManager.selectedProject].addTodo(todoTitle, todoDescription, finalDate, todoPriority, todoDueTime)
    projectManager.addTodo(todoTitle, todoDescription, finalDate, todoPriority, todoDueTime)

    renderCurrentTab(projectManager.selectedTab);
    DOM.form.todo.reset();
})

// Edit form NEED TO REFACTOR BIG TIME!!
DOM.form.edit.addEventListener("submit", () => {
    projectManager.editTodo(projectManager.projects[projectManager.selectedProject].selectedTodo, 
        document.querySelector("#edit-title-input").value,
        document.querySelector("#edit-description-input").value,
        document.querySelector("#edit-priority-input").value,
        document.querySelector("#edit-time-input").value,
        document.querySelector("#edit-dueDate-input").value,)
    renderProjects();
    renderCurrentTab(projectManager.selectedTab);
})

DOM.button.editCancel.addEventListener("click", () => {
    DOM.modal.edit.close();
})
//-------------------------

renderProjects();
renderCurrentTab(projectManager.selectedTab);


// DOM functions
function renderProjects() {
    DOM.container.projects.innerHTML = "";
    DOM.container.noProject.innerHTML = "";

    for (let projectName in projectManager.projects) {
        DOM.container.projects.appendChild(createDOMProjectCards(projectName));
    }

    if (projectManager.selectedProject === null) {
        
        document.querySelector(".filter-btn.selected")?.classList.remove("selected");
        const image = document.createElement("img");
        const noProjectSelectedText = document.createElement("h3");

        image.src = folder
        noProjectSelectedText.textContent = "No project selected";

        DOM.container.noProject.appendChild(image);
        DOM.container.noProject.appendChild(noProjectSelectedText);
    } else {
        if (document.querySelector(".project-list-item.selected")) {
            document.querySelector(".project-list-item.selected").classList.remove("selected")
            
        }

        const listItems = document.querySelectorAll(".project-list-item");

        for (const item of listItems) {
            if (item.querySelector("span").textContent === projectManager.selectedProject) {
                item.classList.add("selected");
            }
        }  
    }
}

function createDOMProjectCards(projectName) {
    const projectCard = document.createElement("li");
    projectCard.classList.add("project-list-item");

    const image = document.createElement("img");
    image.classList.add("project-img");
    image.src = folder;

    const title = document.createElement("span");
    title.classList.add("project-title");

    const deleteBtn = document.createElement("button");

    title.textContent = projectName;
    deleteBtn.textContent = "X";

    deleteBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        if (projectName === projectManager.selectedProject) {
            projectManager.selectedProject = null;
        }

        projectManager.removeProject(projectName)
        renderProjects();
        renderCurrentTab(projectManager.selectedTab);
    })

    projectCard.addEventListener("click", () => {
        projectManager.selectedProject = projectName;
        projectManager.selectedTab = "upcoming";
        document.querySelector(".rp")
        document.querySelector(".filter-btn.selected")?.classList.remove("selected");
        DOM.button.filterUpcoming.classList.add("selected");
        renderProjects();
        renderCurrentTab(projectManager.selectedTab);
    })

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

    DOM.container.noProject.innerHTML = "";

    if (DOM.container.todos.innerHTML === "") {
        const image = document.createElement("img");
        const noUpcomingText = document.createElement("h3");

        image.src = note;
        noUpcomingText.textContent = "No upcoming todos";

        DOM.container.noProject.appendChild(image);
        DOM.container.noProject.appendChild(noUpcomingText);
    }
}

function renderCompleted(projectName) {
    DOM.container.todos.innerHTML = "";
    
    if (projectManager.selectedProject === null) {
        return;
    }

    DOM.container.noProject.innerHTML = "";

    if (projectManager.projects[projectName].completed.length === 0) {
        const image = document.createElement("img");
        const noUpcomingText = document.createElement("h3");

        image.src = checkmark;
        noUpcomingText.textContent = "No completed todos";

        DOM.container.noProject.appendChild(image);
        DOM.container.noProject.appendChild(noUpcomingText);
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

    DOM.container.noProject.innerHTML = "";

    for (let i of projectManager.projects[projectName].todos) {
        const todo = i;

        if (isPast(todo.dueDate)) {
            createDOMTodosCards(todo);
        }
    }

    if (DOM.container.todos.innerHTML === "") {
        const image = document.createElement("img");
        const noUpcomingText = document.createElement("h3");

        image.src = clock;
        noUpcomingText.textContent = "No overdue todos";

        DOM.container.noProject.appendChild(image);
        DOM.container.noProject.appendChild(noUpcomingText);
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
    todoTitle.classList.add("todo-title")
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
        projectManager.completeTodo(todo.id)
        renderProjects();
        renderCurrentTab(projectManager.selectedTab);
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
        projectManager.removeTodo(todo.id)
        renderProjects();
        renderCurrentTab(projectManager.selectedTab);
    })

    todoCard.appendChild(todoComplete);
    todoCard.appendChild(todoTitle);
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

    todoTitle.classList.add("todo-title");

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
        alert("Select a project first");
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

console.log(projectManager)

//Refactor