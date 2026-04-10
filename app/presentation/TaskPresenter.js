class TaskPresenter {
    
    constructor(view, repository) {
        this.view = view;
        this.repository = repository;
        this.correctPIN = "1234";
        this.pendingTitle = "";

        
        this.view.bindLogin(this.handleLogin.bind(this)); 
        this.view.bindAddTask(this.onAddTaskClicked.bind(this));
        this.view.bindModalEvents(
            this.onReplaceClicked.bind(this),
            this.onDiscardFromModal.bind(this),
            this.onModifyClicked.bind(this)
        );
        this.view.bindToggleTask(this.handleToggleTask.bind(this));
        this.view.bindEditTask(this.handleEditTask.bind(this));
        this.view.bindDeleteTask(this.handleDeleteTask.bind(this));
    }

    
    handleLogin(enteredPIN) {
        if (enteredPIN === this.correctPIN) {
            this.view.unlockApp();
            this.updateView();
        } else {
            this.view.showLoginError();
        }
    }

    onAddTaskClicked(title) {
        if (title === "") return;

        if (this.repository.taskExists(title)) {
            this.pendingTitle = title;
            this.view.showModal();
        } else {
            this.repository.addTask(title);
            this.view.clearTaskInput();
            this.updateView();
        }
    }

    onReplaceClicked() {
        this.view.showEditSection(this.pendingTitle);
    }

    onModifyClicked(newTitle) {
        if (newTitle === "") return;
        this.repository.addTask(newTitle);
        this.closeModal();
        this.updateView();
    }

    onDiscardFromModal() {
        this.closeModal();
    }

    closeModal() {
        this.pendingTitle = "";
        this.view.closeModal();
    }

    handleToggleTask(id) {
        this.repository.toggleTask(id);
        this.updateView();
    }

    handleEditTask(id, newTitle) {
        this.repository.editTask(id, newTitle);
        this.updateView();
    }

    handleDeleteTask(id) {
        this.repository.deleteTask(id);
        this.updateView();
    }

    updateView() {
        const tasks = this.repository.getTasks();
        this.view.renderTasks(tasks);
    }
}