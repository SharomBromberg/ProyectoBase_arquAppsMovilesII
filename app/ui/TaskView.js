class TaskView {
    constructor() {

        this.loginOverlay = document.getElementById("loginOverlay");
        this.appContainer = document.getElementById("appContainer");
        this.pinInput = document.getElementById("pinInput");
        this.loginError = document.getElementById("loginError");
        this.loginBtn = document.getElementById("loginBtn");

        this.taskInput = document.getElementById("taskInput");
        this.addTaskBtn = document.getElementById("addButton");
        this.taskList = document.getElementById("taskList");

        this.duplicateModal = document.getElementById("duplicateModal");
        this.modalPrimaryActions = document.getElementById("modalPrimaryActions");
        this.modalEditSection = document.getElementById("modalEditSection");
        this.newTitleInput = document.getElementById("newTitleInput");
        this.replaceBtn = document.getElementById("replaceModalBtn");
        this.discardBtn = document.getElementById("discardModalBtn");
        this.modifyBtn = document.getElementById("modifyModalBtn");
    }


    unlockApp() {
        this.loginOverlay.classList.add("hidden");
        this.appContainer.classList.remove("hidden");
    }

    showLoginError() {
        this.loginError.classList.remove("hidden");
        this.pinInput.value = "";
    }
    renderTasks(tasks) {
        this.taskList.innerHTML = "";

        tasks.forEach((task) => {

            const li = document.createElement("li");
            if (task.completed) li.classList.add("completed");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = task.completed;
            checkbox.dataset.id = task.id;

            const span = document.createElement("span");
            span.textContent = task.title;
            span.className = "task-text";

            const editBtn = document.createElement("button");
            editBtn.textContent = "✏️";
            editBtn.className = "action-btn";
            editBtn.dataset.id = task.id;
            editBtn.dataset.title = task.title;

            editBtn.dataset.action = "edit";

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "🗑️";
            deleteBtn.className = "action-btn";
            deleteBtn.dataset.id = task.id;

            deleteBtn.dataset.action = "delete";

            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(editBtn);
            li.appendChild(deleteBtn);

            this.taskList.appendChild(li);
        });
    }

    clearTaskInput() {
        this.taskInput.value = "";
    }

    showModal() {
        this.duplicateModal.classList.remove("hidden");
        this.modalPrimaryActions.classList.remove("hidden");
        this.modalEditSection.classList.add("hidden");
    }

    showEditSection(pendingTitle) {
        this.modalPrimaryActions.classList.add("hidden");
        this.modalEditSection.classList.remove("hidden");
        this.newTitleInput.value = pendingTitle;
        this.newTitleInput.focus();
    }

    closeModal() {
        this.duplicateModal.classList.add("hidden");
        this.newTitleInput.value = "";
    }

    bindLogin(handler) {
        this.loginBtn.addEventListener("click", () => handler(this.pinInput.value));
    }

    bindAddTask(handler) {
        this.addTaskBtn.addEventListener("click", () =>
            handler(this.taskInput.value.trim()),
        );
    }

    bindModalEvents(onReplace, onDiscard, onModify) {
        this.replaceBtn.addEventListener("click", onReplace);
        this.discardBtn.addEventListener("click", onDiscard);
        this.modifyBtn.addEventListener("click", () =>
            onModify(this.newTitleInput.value.trim()),
        );
    }

    bindToggleTask(handler) {
        this.taskList.addEventListener("change", (event) => {
            if (event.target.type === "checkbox") {
                handler(parseInt(event.target.dataset.id));
            }
        });
    }
   
    bindEditTask(handler) {
        this.taskList.addEventListener("click", (event) => {
            const btn = event.target.closest("button");
            if (btn && btn.dataset.action === "edit") {
                const id = parseInt(btn.dataset.id);
                
                const currentTitle = btn.dataset.title;
                const newTitle = prompt("Edita tu tarea:", currentTitle);
                if (newTitle && newTitle.trim() !== "") {
                    handler(id, newTitle.trim());
                }
            }
        });
    }

    bindEditTask(handler) {
        this.taskList.addEventListener("click", (event) => {
            const btn = event.target.closest("button");
            if (btn && btn.dataset.action === "edit") {
                const id = parseInt(btn.dataset.id); const currentTitle = btn.dataset.title;
                const newTitle = prompt("Edita tu tarea:", currentTitle);
                if (newTitle && newTitle.trim() !== "") {
                    handler(id, newTitle.trim());
                }
            }
        });
    }

    bindDeleteTask(handler) {
        this.taskList.addEventListener("click", (event) => {
            const btn = event.target.closest("button");
            if (btn && btn.dataset.action === "delete") {
                handler(parseInt(btn.dataset.id));
            }
        });
    }
}
