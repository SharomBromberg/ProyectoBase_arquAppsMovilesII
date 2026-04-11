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

***

# Guía de Implementación: Módulo 3 - Seguridad y Autenticación (El Escudo)

Esta guía detalla los pasos exactos para implementar la capa de seguridad y refactorizar la aplicación hacia un patrón MVP estricto. Seguir cada paso en el orden establecido.

### Paso 1: Preparación Visual (Archivos `index.html` y `styles.css`)

**Objetivo:** Preparar la interfaz gráfica para la pantalla de bloqueo sin mezclar estilos directamente en el HTML.

1. **Agregar** las siguientes clases utilitarias al final del archivo `styles.css`:
```css
/* Clases para manejar la visibilidad y el bloqueo */
.hidden { display: none !important; }

.overlay-fullscreen {
    position: fixed; top: 0; left: 0; 
    width: 100%; height: 100%; 
    background: white; z-index: 999; 
    display: flex; flex-direction: column; 
    justify-content: center; align-items: center;
}
.text-error { color: red; }
```

2. **Modificar** el archivo `index.html` para incluir el escudo de seguridad y ocultar la aplicación principal al inicio. Agregar esto debajo de la etiqueta `<body>`:
```html
<!-- Pantalla de Autenticación -->
<div id="loginOverlay" class="overlay-fullscreen">
    <h2>🔒 App Bloqueada</h2>
    <input type="password" id="pinInput" placeholder="PIN: 1234">
    <button id="loginBtn">Desbloquear</button>
    <p id="loginError" class="text-error hidden">PIN Incorrecto</p>
</div>

<!-- Envolver la app original y ocultarla inicialmente -->
<div id="appContainer" class="hidden">
    <!-- El HTML de las tareas y el modal va aquí -->
</div>
```

---

### Paso 2: Aislar la Interfaz Gráfica (`TaskView.js`)

**Objetivo:** Extraer toda la manipulación del DOM que está incorrectamente alojada en el Presentador.

1. **Crear** un nuevo archivo llamado `TaskView.js` dentro de la carpeta `app/ui/`.
2. **Capturar** los elementos del DOM en el constructor de esta nueva clase:
```javascript
class TaskView {
    constructor() {
        this.loginOverlay = document.getElementById('loginOverlay');
        this.appContainer = document.getElementById('appContainer');
        this.pinInput = document.getElementById('pinInput');
        this.loginError = document.getElementById('loginError');
        this.taskList = document.getElementById('taskList');
        // ... (Capturar también los elementos del modal y botones)
    }
}
```
3. **Crear** métodos públicos para manipular las clases CSS (reemplazando el uso de `style` e `innerHTML` del presentador original):
```javascript
    // Mostrar y ocultar la app
    unlockApp() {
        this.loginOverlay.classList.add('hidden');
        this.appContainer.classList.remove('hidden');
    }
    showLoginError() {
        this.loginError.classList.remove('hidden');
        this.pinInput.value = ''; 
    }

    // Dibujar lista dinámicamente
    renderTasks(tasks) {
        this.taskList.innerHTML = ""; 
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.textContent = task.title;
            this.taskList.appendChild(li);
        });
    }

    // Eventos
    bindLogin(handler) {
        document.getElementById('loginBtn').addEventListener('click', () => handler(this.pinInput.value));
    }
```
4. **Agregar** la etiqueta `<script src="app/ui/TaskView.js"></script>` en el `index.html`, justo antes del script del Presentador.

---

### Paso 3: Refactorización del Presentador (`TaskPresenter.js`)

**Objetivo:** Corregir errores estructurales y delegar las decisiones visuales a la nueva Vista.

1. **Corregir** el constructor. En el código original se intenta usar `this.view = view` sin recibirlo como parámetro. Cambiar el constructor a:
```javascript
// REEMPLAZAR: constructor(repository) { ... }
// POR ESTO:
constructor(view, repository) { 
    this.view = view; 
    this.repository = repository;
    this.correctPIN = "1234";
    // ...
}
```

2. **Eliminar** toda instrucción que contenga `.classList`, `.innerHTML` o `.style`. Reemplazar estas llamadas por delegaciones a la Vista.
Por ejemplo, en el método de login original se usan estilos directos: `this.loginOverlay.style.display = 'none';`. 
**Cambiar** la lógica a:
```javascript
handleLogin(enteredPIN) { 
    if (enteredPIN === this.correctPIN) { 
        this.view.unlockApp(); // Delegar a la vista
        this.updateView(); 
    } else {
        this.view.showLoginError(); // Delegar a la vista
    }
}
```

3. **Reemplazar** la manipulación del modal original. Donde el código dice `this.duplicateModal.classList.add("hidden");` o `this.taskList.innerHTML = "";`, **cambiar** por:
```javascript
closeModal() {
    this.pendingTitle = "";
    this.view.closeModal(); // Ejecutar método en TaskView
}

updateView() {
    const tasks = this.repository.getTasks();
    this.view.renderTasks(tasks); // Pasar los datos a la Vista
}
```

---

### Paso 4: Protección Pasiva y Cifrado (`TaskRepository.js`)

**Objetivo:** Asegurar que los datos viajen a la nube y se guarden localmente de forma incomprensible para terceros.

1. **Agregar** los motores de cifrado al repositorio:
```javascript
_encryptData(dataString) {
    return btoa(unescape(encodeURIComponent(dataString)));
}
_decryptData(encryptedString) {
    return decodeURIComponent(escape(atob(encryptedString)));
}
```

2. **Modificar** el constructor. El código original recupera las tareas expuestas con `localStorage.getItem("misTareasPWA")`. **Cambiar** esta lectura para extraer y descifrar la versión segura:
```javascript
// REEMPLAZAR LA LECTURA EN EL CONSTRUCTOR POR:
const savedEncryptedTasks = localStorage.getItem("misTareasPWASecure");

if (savedEncryptedTasks) {
    this.tasks = JSON.parse(this._decryptData(savedEncryptedTasks));
} else {
    this.tasks = [];
}
```

3. **Actualizar** el guardado local. **Modificar** o crear el método `_saveToLocalStorage` para cifrar el JSON antes de guardarlo e invocar la sincronización en la nube pasando el paquete seguro:
```javascript
_saveToLocalStorage() {
    const jsonString = JSON.stringify(this.tasks);
    const encryptedData = this._encryptData(jsonString); // Cifrado activo
    
    localStorage.setItem("misTareasPWASecure", encryptedData);
    this._syncWithCloud(encryptedData); // Pasar dato cifrado al fetch
}
```

4. **Verificar** el envío a la nube. El método `_syncWithCloud` original ya espera enviar un `body: encryptedPayload`. Asegurar que la función reciba este parámetro desde el guardado local:
```javascript
// Asegurar que el método reciba el parámetro
async _syncWithCloud(encryptedPayload) {
    // ... código del fetch existente
}
```

----------------------
### Guía Práctica: Implementación del Módulo 4

#### Paso 1: Intervención en la Capa de Datos (`app/data/TaskRepository.js`)

**Objetivo Arquitectónico:** Reemplazar el servicio de simulación temporal por la API RESTful "JSONPlaceholder" para la obtención (GET) y el envío simulado (POST) de datos. La lógica de red pertenece exclusivamente al repositorio.

**1.1. Actualización del Constructor**
Ubiquen el método `constructor()` en su archivo `TaskRepository.js`. Deberán reemplazar la URL anterior por el nuevo *endpoint* de la API. Reemplacen su constructor actual por el siguiente bloque:

```javascript
    constructor() {
        // Nueva directiva: Asignación del endpoint de la API RESTful externa
        this.apiUrl = "https://jsonplaceholder.typicode.com/todos";
        
        const savedEncryptedTasks = localStorage.getItem("misTareasPWASecure");
        if (savedEncryptedTasks) {
            this.tasks = JSON.parse(this._decryptData(savedEncryptedTasks));
        } else {
            this.tasks = [];
        }
    }
```

**1.2. Implementación de la Obtención de Datos (GET)**
Inmediatamente debajo del constructor, agreguen el siguiente método asíncrono. Su función es consumir la API externa únicamente si la estructura de datos local se encuentra vacía, preservando así sus datos preexistentes:

```javascript
    async loadExternalTasks() {
        if (this.tasks.length === 0) {
            try {
                const response = await fetch(`${this.apiUrl}?_limit=3`);
                const apiTasks = await response.json();
                
                this.tasks = apiTasks.map(t => ({ id: t.id, title: t.title, completed: t.completed }));
                
                this._saveToLocalStorage();
                console.log("Datos obtenidos de JSONPlaceholder exitosamente.");
            } catch (error) {
                console.warn("Error de red: No se pudo conectar a la API externa.");
            }
        }
    }
```

**1.3. Modificación de la Sincronización en la Nube (POST)**
Ubiquen el método `_syncWithCloud()` que desarrollamos en el Módulo 2 y reemplácenlo en su totalidad por esta nueva versión, la cual formatea correctamente el paquete de envío para la API RESTful:

```javascript
    async _syncWithCloud() {
        if(this.tasks.length === 0) return;
        
        const lastTask = this.tasks[this.tasks.length - 1];

        try {
            await fetch(this.apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=UTF-8" },
                body: JSON.stringify(lastTask) 
            });
            console.log("Sincronizacion RESTful (POST) exitosa en la nube.");
        } catch (error) {
            console.warn("Sin conexion. Datos asegurados en LocalStorage.");
        }
    }
```
*Nota: Los métodos de cifrado (`_encryptData`, `_decryptData`) y los métodos CRUD (`addTask`, `deleteTask`, etc.) no deben sufrir ninguna alteración.*

---

#### Paso 2: Intervención en la Capa de Presentación - Vista (`app/ui/TaskView.js`)

**Objetivo Arquitectónico:** Las notificaciones push son una interacción directa con la interfaz del sistema operativo, por ende, su gestión recae en la capa de la Vista. 

Desplácense hasta el final del archivo `TaskView.js`. Inmediatamente antes de la última llave de cierre `}` de la clase, incorporen los siguientes dos métodos:

```javascript
    requestNotificationPermission() {
        if ("Notification" in window) {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    console.log("Permiso de notificaciones concedido por el usuario.");
                }
            });
        }
    }

    showNotification(title, message) {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(title, {
                body: message,
                icon: "assets/MyTaskManager.png" 
            });
        }
    }
```

---

#### Paso 3: Intervención en la Capa de Presentación - Presentador (`app/presentation/TaskPresenter.js`)

**Objetivo Arquitectónico:** El Presentador se desempeña como el orquestador de la aplicación. Es su deber invocar la solicitud de permisos, ordenar la carga de datos externos al iniciar sesión y ejecutar la notificación cuando se confirme la creación de una entidad.

**3.1. Refactorización del Método de Autenticación**
Ubiquen el método `handleLogin`. Deberán reemplazarlo por la siguiente estructura asíncrona, la cual fuerza a la aplicación a esperar la respuesta de la red antes de retirar el escudo de seguridad:

```javascript
    async handleLogin(enteredPIN) {
        if (enteredPIN === this.correctPIN) {
            this.view.requestNotificationPermission();
            
            await this.repository.loadExternalTasks();
            
            this.view.unlockApp();
            this.updateView();
        } else {
            this.view.showLoginError();
        }
    }
```

**3.2. Integración de la Notificación en la Creación de Tareas**
Ubiquen el método `onAddTaskClicked`. Su tarea es agregar la invocación de la notificación exclusivamente en el bloque lógico de éxito, antes de finalizar la función. El método debe quedar de la siguiente manera:

```javascript
    onAddTaskClicked(title) {
        if (title === "") return;

        if (this.repository.taskExists(title)) {
            this.pendingTitle = title;
            this.view.showModal();
        } else {
            this.repository.addTask(title);
            this.view.clearTaskInput();
            this.updateView();
            
            this.view.showNotification("Nueva Tarea Registrada", `Se ha agregado la tarea: ${title}`);
        }
    }
```

---

### Protocolo de Validación

Para corroborar la correcta implementación de estos requerimientos, procedan con los siguientes pasos de auditoría:
1. Eliminar los datos de navegación (Caché y LocalStorage) para simular una instalación limpia.
2. Ingresar el PIN de seguridad asignado ("1234").
3. Otorgar los permisos de notificación cuando el navegador lo solicite a través del hilo principal.
4. Verificar en la interfaz gráfica la inserción exitosa de tres registros importados desde la API RESTful.
5. Ingresar una nueva tarea manual y valide la recepción de la notificación push a nivel de sistema.
