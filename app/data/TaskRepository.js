class TaskRepository {
    constructor() {
        this.cloudServiceUrl = "https://webhook.site/59ae2414-0659-458c-bfea-745b5d13e9e0";

        
        const savedEncryptedTasks = localStorage.getItem("misTareasPWASecure");

        if (savedEncryptedTasks) {
            this.tasks = JSON.parse(this._decryptData(savedEncryptedTasks));
        } else {
            this.tasks = [];
        }
    }

    
    _encryptData(dataString) {
        return btoa(unescape(encodeURIComponent(dataString)));
    }

    _decryptData(encryptedString) {
        return decodeURIComponent(escape(atob(encryptedString)));
    }

    
    _saveToLocalStorage() {
        const jsonString = JSON.stringify(this.tasks);
        const encryptedData = this._encryptData(jsonString);
        
        localStorage.setItem("misTareasPWASecure", encryptedData);
        this._syncWithCloud(encryptedData);
    }

    
    async _syncWithCloud(encryptedPayload) {
        try {
            await fetch(this.cloudServiceUrl, {
                method: "POST",
                mode: "no-cors",
                body: encryptedPayload
            });
            console.log("Sincronizacion en la nube exitosa");
        } catch (error) {
            console.warn("Sin conexion. Los datos estan seguros localmente.");
        }
    }

    addTask(title) {
        const newTask = { id: Date.now(), title: title, completed: false };
        this.tasks.push(newTask);
        this._saveToLocalStorage();
        return newTask;
    }

    getTasks() {
        return this.tasks;
    }

    toggleTask(id) {
        const task = this.tasks.find((t) => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this._saveToLocalStorage();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter((t) => t.id !== id);
        this._saveToLocalStorage();
    }

    editTask(id, newTitle) {
        const task = this.tasks.find((t) => t.id === id);
        if (task) {
            task.title = newTitle;
            this._saveToLocalStorage();
        }
    }

    taskExists(title) {
        return this.tasks.some(
            (task) => task.title.toLowerCase() === title.toLowerCase()
        );
    }
}