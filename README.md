### Práctica Módulo 1: Estructurando nuestra primera App (PWA) con MVP y Clean Architecture

**Objetivo:** Desarrollar una aplicación móvil sencilla de "Lista de Tareas" (To-Do App) utilizando formato PWA, aplicando una separación estricta entre los datos, la lógica de presentación y la interfaz de usuario para garantizar la modularidad y mantenibilidad.


### 1. Estructura de Carpetas (Clean Architecture)
Para aplicar Clean Architecture, lo principal es no mezclar el código, asignando a todo un lugar específico.

*   `index.html` (Nuestra View)
*   `styles.css`
*   `app/`
    *   `domain/` (Entidades y casos de uso)
        *   `Task.js`
    *   `data/` (Gestión de datos)
        *   `TaskRepository.js`
    *   `presentation/` (El Presentador del patrón MVP)
        *   `TaskPresenter.js`
*   `assets/` (Imágenes)
    *   `MyTaskManager.png`
    *   `MyTaskManager192.png`
    *   `MyTaskManager512.png`
    *   `ScreenShot.png`
    *   `LandScapeScreenShot.png`
*   `manifest.json` (Para convertirla en PWA)
*   `sw.js` (Service Worker para la PWA)

---

### 2. La Capa de Dominio (`app/domain/Task.js`)
Es el núcleo de la aplicación; aquí solo hay reglas de negocio.

```javascript
// Entidad básica
class Task {
    constructor(id, title) {
        this.id = id;
        this.title = title;
        this.completed = false;
    }
}
```

---

### 3. La Capa de Datos (`app/data/TaskRepository.js`)
Aquí gestionamos dónde se guardan los datos. Hemos integrado el LocalStorage y los métodos necesarios para editar, eliminar y la nueva función para **reemplazar** tareas repetidas.

```javascript
class TaskRepository {
  constructor() {
    const savedTasks = localStorage.getItem("misTareasPWA");
    this.tasks = savedTasks ? JSON.parse(savedTasks) : [];
  }

  _saveToLocalStorage() {
    localStorage.setItem("misTareasPWA", JSON.stringify(this.tasks));
  }

  addTask(title) {
    const newTask = new Task(Date.now(), title);
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
      (task) => task.title.toLowerCase() === title.toLowerCase(),
    );
  }
}
```

---

### 4. La Vista y los Estilos (`index.html` y `styles.css`)
Siguiendo la regla de oro del MVP: La vista es "tonta", no toma decisiones ni guarda datos, solo muestra lo que el Presentador le ordena y captura los clics. 

**`index.html`**:
```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Primera App PWA</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="manifest" href="manifest.json">
    <link rel="icon" type="image/png" href="assets/MyTaskManager.png">
    <script>
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('Service Worker registrado con éxito:', registration);
                })
                .catch(error => {
                    console.error('Error al registrar el SW:', error);
                });
        } else {
            console.warn('Service Workers no son soportados en este navegador.');
        }
    </script>
</head>

<body>
    <h1>Mis Tareas</h1>
    <div class="input-container">
        <input type="text" id="taskInput" placeholder="Nueva tarea...">
        <button id="addButton">Añadir</button>
    </div>

    <ul id="taskList"></ul>

    <!-- Modal de Tarea Repetida (100% libre de estilos en línea) -->
    <div id="duplicateModal" class="modal-overlay hidden">
        <div class="modal-content">
            <h3 class="modal-title">¡Tarea Repetida!</h3>
            <p>Esta tarea ya existe. ¿Qué deseas hacer?</p>

            <div id="modalPrimaryActions" class="modal-actions">
                <button id="replaceModalBtn" class="btn-replace">Reemplazar</button>
                <button id="discardModalBtn" class="btn-discard">Descartar</button>
            </div>

            <div id="modalEditSection" class="modal-edit-section hidden">
                <input type="text" id="newTitleInput" class="modal-input" placeholder="Nuevo nombre de tarea...">
                <button id="modifyModalBtn" class="btn-modify">Modificar</button>
            </div>
        </div>
    </div>

    <!-- Cargar los scripts respetando la Clean Architecture -->
    <script src="app/domain/Task.js"></script>
    <script src="app/data/TaskRepository.js"></script>
    <script src="app/presentation/TaskPresenter.js"></script>
    <script>
        const repository = new TaskRepository();
        const presenter = new TaskPresenter(repository);
    </script>
</body>

</html>
```

**`styles.css`** *(Estilos modernos conversados previamente)*:
```css
body {
    font-family: sans-serif;
    background-color: #f4f7f6;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
}

.input-container {
    display: flex;
    width: 100%;
    max-width: 400px;
    gap: 10px;
    margin-bottom: 20px;
}

#taskInput {
    flex-grow: 1;
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 16px;
}

#addButton {
    padding: 12px 20px;
    background-color: #2ecc71;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
}

#taskList {
    list-style-type: none;
    padding: 0;
    width: 100%;
    max-width: 400px;
}

#taskList li {
    background: white;
    margin-bottom: 10px;
    padding: 15px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.task-text {
    flex-grow: 1;
    font-size: 16px;
}

.completed .task-text {
    text-decoration: line-through;
    color: #95a5a6;
}

.action-btn {
    border: none;
    background: none;
    cursor: pointer;
    font-size: 18px;
}

/* Estilos del Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 20px;
    margin: 40% auto;
    width: 90%;
    max-width: 350px;
    border-radius: 8px;
    text-align: center;
}

.modal-title {
    color: #e74c3c;
    margin-top: 0;
}

.modal-actions {
    display: flex;
    justify-content: space-around;
    margin-top: 20px;
}

.btn-replace {
    padding: 10px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.btn-discard {
    padding: 10px;
    background: #95a5a6;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.modal-edit-section {
    margin-top: 20px;
}

.modal-input {
    width: 90%;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 14px;
}

.btn-modify {
    padding: 10px;
    width: 95%;
    background: #2ecc71;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

/* Clase utilitaria para ocultar elementos desde JavaScript */
.hidden {
    display: none !important;
}
```

---

### 5. El Presentador (`app/presentation/TaskPresenter.js`)
El cerebro que conecta la Vista con los Datos. Orquesta el CRUD, dibuja dinámicamente los elementos y maneja el modal de validación.

```javascript
class TaskPresenter {
  constructor(repository) {
    this.repository = repository;

    // Elementos UI principales
    this.taskInput = document.getElementById("taskInput");
    this.addButton = document.getElementById("addButton");
    this.taskList = document.getElementById("taskList");

    // Elementos del Modal
    this.duplicateModal = document.getElementById("duplicateModal");
    this.modalPrimaryActions = document.getElementById("modalPrimaryActions");
    this.replaceModalBtn = document.getElementById("replaceModalBtn");
    this.discardModalBtn = document.getElementById("discardModalBtn");
    this.modalEditSection = document.getElementById("modalEditSection");
    this.newTitleInput = document.getElementById("newTitleInput");
    this.modifyModalBtn = document.getElementById("modifyModalBtn");

    this.pendingTitle = "";

    // Listeners de eventos
    this.addButton.addEventListener("click", () => this.onAddTaskClicked());
    this.replaceModalBtn.addEventListener("click", () =>
      this.onReplaceClicked(),
    );
    this.discardModalBtn.addEventListener("click", () =>
      this.onDiscardFromModal(),
    );
    this.modifyModalBtn.addEventListener("click", () => this.onModifyClicked());

    // Inicializar la vista dibujando las tareas guardadas
    this.updateView();
  }

  onAddTaskClicked() {
    const title = this.taskInput.value.trim();
    if (title === "") return;

    if (this.repository.taskExists(title)) {
      this.pendingTitle = title;
      this.showModal();
      return;
    }

    this.repository.addTask(title);
    this.updateView();
    this.taskInput.value = "";
  }

  // --- Control del Modal usando clases CSS ---
  showModal() {
    this.duplicateModal.classList.remove("hidden");
    this.modalPrimaryActions.classList.remove("hidden");
    this.modalEditSection.classList.add("hidden");
  }

  onReplaceClicked() {
    this.modalPrimaryActions.classList.add("hidden");
    this.modalEditSection.classList.remove("hidden");
    this.newTitleInput.value = this.pendingTitle;
    this.newTitleInput.focus();
  }

  onModifyClicked() {
    const newTitle = this.newTitleInput.value.trim();
    if (newTitle === "") return;

    if (this.repository.taskExists(newTitle)) {
      alert("Ese nombre de tarea también existe. Por favor, intenta con otro.");
      return;
    }

    this.repository.addTask(newTitle);
    this.closeModal();
    this.updateView();
    this.taskInput.value = "";
  }

  onDiscardFromModal() {
    this.closeModal();
  }

  closeModal() {
    this.duplicateModal.classList.add("hidden");
    this.newTitleInput.value = "";
    this.pendingTitle = "";
  }

  // --- Dibujado Dinámico de la Vista ---
  updateView() {
    this.taskList.innerHTML = ""; // Limpiar lista
    const tasks = this.repository.getTasks(); // Obtener tareas

    tasks.forEach((task) => {
      const li = document.createElement("li");
      if (task.completed) li.classList.add("completed");

      // 1. Checkbox
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.completed;
      checkbox.addEventListener("change", () => {
        this.repository.toggleTask(task.id);
        this.updateView();
      });

      // 2. Texto
      const span = document.createElement("span");
      span.textContent = task.title;
      span.className = "task-text";

      // 3. Botón Editar
      const editBtn = document.createElement("button");
      editBtn.textContent = "✏️";
      editBtn.className = "action-btn";
      editBtn.addEventListener("click", () => {
        const newTitle = prompt("Edita tu tarea:", task.title);
        if (newTitle && newTitle.trim() !== "") {
          this.repository.editTask(task.id, newTitle.trim());
          this.updateView();
        }
      });

      // 4. Botón Eliminar
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️";
      deleteBtn.className = "action-btn";
      deleteBtn.addEventListener("click", () => {
        this.repository.deleteTask(task.id);
        this.updateView();
      });

      // Ensamblar la fila
      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(editBtn);
      li.appendChild(deleteBtn);

      this.taskList.appendChild(li);
    });
  }
}
```

---

### 6. Archivos PWA (`manifest.json` y `sw.js`)
Requeridos para que la aplicación sea instalable en los dispositivos móviles.

**`manifest.json`**:
```json
{
    "id": "/index.html",
    "name": "To-Do App PWA",
    "short_name": "To-Do",
    "start_url": "index.html",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#000000",
    "icons": [
        {
            "src": "/assets/MyTaskManager192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/assets/MyTaskManager512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ],
    "screenshots": [
        {
            "src": "/assets/ScreenShot.png",
            "sizes": "458x805",
            "type": "image/png",
            "form_factor": "narrow"
        },
        {
            "src": "/assets/LandScapeScreenShot.png",
            "sizes": "1917x909",
            "type": "image/png",
            "form_factor": "wide"
        }
    ]
}
```

**`sw.js`**:
```javascript
self.addEventListener('fetch', function(event) {
    // Service worker mínimo para que sea reconocida como PWA
});
```