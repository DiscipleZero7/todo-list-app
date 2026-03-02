import { addDays, format, isPast } from "date-fns";

let projectStorage = localStorage.getItem("projects");
if (projectStorage === null) {
    projectStorage = {default: createProject("default")};
} else {
    projectStorage = JSON.parse(localStorage.getItem("projects"))
}

export const projectManager = {
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
//Refactor