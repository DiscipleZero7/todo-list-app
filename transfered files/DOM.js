import { projectManager as projectM} from "./main.js"

console.log(projectM)

const projectsContainer = document.querySelector(".projects-container");
const todoContainer = document.querySelector(".todo-container");
const addProjectBtn = document.querySelector(".create-project-btn");

renderProjects();

function renderProjects() {
    for (let e in projectM.projects) {
        const project = document.createElement("div");
        project.textContent = e;
        projectsContainer.appendChild(project);

        renderTodos(e)
    }
}

function renderTodos(project) {
    const todo = document.createElement("div")
    todo.textContent = projectM.projects[project].todos

    todoContainer.appendChild(todo)
}

addProjectBtn.addEventListener("click", () => renderProjects)