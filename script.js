class ToDo {
    selectors = {
        root: '[data-js-todo]',
        newTaskTitleInput: '[data-js-todo-new-task-title-input]',
        newTaskAboutInput: '[data-js-todo-new-task-about-input]',
        list: '[data-js-todo-list]',
        addButton: '[data-js-todo-add-button]', 
        noTasksMessage: '[data-js-no-tasks-message]', 
        item: '[data-js-todo-item]', 
        itemDeleteButton: '[data-js-todo-item-delete-button]', 
        deleteDialog: '[data-js-todo-delete-dialog]',
        deleteDialogConfirmButton: '[data-js-todo-delete-dialog-confirm-button]',
        deleteDialogCancelButton: '[data-js-todo-delete-dialog-cancel-button]'
    }

    localStorageKey = 'todo-items'

    elements = {}

    constructor() {
        this.rootElement = document.querySelector(this.selectors.root)
        if (!this.rootElement) {
            console.error('Root element not found!')
            return
        }
        this.newTaskTitleInputElement = this.rootElement.querySelector(this.selectors.newTaskTitleInput)
        this.newTaskAboutInputElement = this.rootElement.querySelector(this.selectors.newTaskAboutInput)
        this.listElement = this.rootElement.querySelector(this.selectors.list)
        this.noTasksMessageElement = this.rootElement.querySelector(this.selectors.noTasksMessage)
        this.addButtonElement = this.rootElement.querySelector(this.selectors.addButton)
        this.itemDeleteButtonElement = this.rootElement.querySelector(this.selectors.itemDeleteButton)

        if (!this.newTaskTitleInputElement || !this.newTaskAboutInputElement || 
            !this.listElement || !this.noTasksMessageElement || !this.addButtonElement) {
            console.error('Some elements not found!')
            return
        }

        this.state = {
            items: this.getItemsFromLocalStorage(),
        }
        this.render()
        this.bindEvents()
        console.log('ToDo initialized') 
    }

    getItemsFromLocalStorage() {
        const rawData = localStorage.getItem(this.localStorageKey)

        if (!rawData) {
            return []
        }

        try {
            const parseData = JSON.parse(rawData)

            return Array.isArray(parseData) ? parseData : []
        } catch {
            console.error('Todo items parse error')
            return []
        }
}

    saveItemsToLocalStorage () {
        localStorage.setItem(
            this.localStorageKey,
            JSON.stringify(this.state.items)
        )
    }

    render() {
        const items = this.state.items

        this.listElement.innerHTML = items.map(( {id, title, about} ) => `
            <li data-js-todo-item="${id}">
                <div class="task__window"> 
                    <div "style="flex: 1; text-align:left;">
                        <h3>${title}</h3>
                        <p>${about}</p>
                    </div>
                    <button class="button__dell" data-task-id=${id} data-js-todo-item-delete-button>
                        <img src="./assets/cross.svg" />
                    </button>
                </div>
                <div class="task__buttons" style="display: none; width: 100%; margin-top: 10px;">
                    <div class="button-group" style="display: flex; justify-content: center; gap: 10px;">
                        <button class="button__task__share">
                            <img src="./assets/share.svg" alt="Поделиться" />
                        </button>
                        <button class="button__task__info">
                            i
                        </button>
                        <button class="button__task__edit">
                            <img src="./assets/edit.svg" alt="Редактировать" />
                        </button>
                    </div>
                </div>
            </li>
        `).join('')

        const isEmptyItems = this.state.items.length === 0

        this.noTasksMessageElement.innerHTML = isEmptyItems ? `
            <div></div>
            <p>Нет задач</p>
            <div></div>
        ` : '';

    }

    addItem(title, about) {
        this.state.items.push({
            id: crypto?.randomUUID() ?? Date.now().toString(),
            title,
            about,
        })
        this.saveItemsToLocalStorage()
        this.render()
    }

    deleteItem(id) {
        this.state.items = this.state.items.filter((item) => item.id !== id)
        this.saveItemsToLocalStorage()
        this.render()
    }

    showConfirmation(taskId) {
        const dialogHTML = `
            <div class="dialog__overlay" data-js-todo-delete-dialog>
                <section class="dialog__window">
                    <p class="dialog__text">Удалить задачу?</p>
                    <div style="display: flex; justify-content: center; gap: 15px;">
                        <button class="button__window__action dialog__confirm_btn" data-js-todo-delete-dialog-confirm-button>Да</button>
                        <button class="button__window__action dialog__cancel_btn" data-js-todo-delete-dialog-cancel-button>Нет</button>
                    </div>
                </section>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
        
        const deleteDialogElement = document.querySelector(this.selectors.deleteDialog);
        const confirmButton = deleteDialogElement.querySelector(this.selectors.deleteDialogConfirmButton);
        const cancelButton = deleteDialogElement.querySelector(this.selectors.deleteDialogCancelButton);
        
        const confirmHandler = () => {
            this.deleteItem(taskId);
            deleteDialogElement.remove();
            confirmButton.removeEventListener('click', confirmHandler);
            cancelButton.removeEventListener('click', cancelHandler);
        };

        const cancelHandler = () => {
            deleteDialogElement.remove();
            confirmButton.removeEventListener('click', confirmHandler);
            cancelButton.removeEventListener('click', cancelHandler);
        };

        confirmButton.addEventListener('click', confirmHandler);
        cancelButton.addEventListener('click', cancelHandler);
    }

    onAddButtonClick = (event) => {
        event.preventDefault()
        
        const title = this.newTaskTitleInputElement.value.trim()
        const about = this.newTaskAboutInputElement.value.trim()
        

        if (title.length > 0 && about.length > 0) {
            this.addItem(title, about)
            this.newTaskTitleInputElement.value = ''
            this.newTaskAboutInputElement.value = ''
        } else {
            alert('Пожалуйста, заполните оба поля!')
            if (title.length === 0) {
                this.newTaskTitleInputElement.style.border = '2px solid red'
            }
            if (about.length === 0) {
                this.newTaskAboutInputElement.style.border = '2px solid red'
            }
        }
    }

    handleTaskClick = (event) => {
        // Обработка кнопки удаления
        const deleteButton = event.target.closest(this.selectors.itemDeleteButton);
        if (deleteButton) {
            const taskId = deleteButton.getAttribute('data-task-id');
            if (taskId) {
                this.showConfirmation(taskId);
                return; 
            }
        }
        
        // Обработка клика по самой задаче
        const taskElement = event.target.closest(this.selectors.item);
        if (!taskElement) return;
        
        if (event.target.closest('.button-group')) {
            return;
        }
        
        const buttonsSection = taskElement.querySelector('.task__buttons');
        if (!buttonsSection) return;
        
        document.querySelectorAll('.task__buttons').forEach(buttons => {
            if (buttons !== buttonsSection) {
                buttons.style.display = 'none';
            }
        });
        
        const isVisible = buttonsSection.style.display === 'block';
        buttonsSection.style.display = isVisible ? 'none' : 'block';
    }

    bindEvents() {
        this.addButtonElement.addEventListener('click', this.onAddButtonClick)

        this.newTaskTitleInputElement.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.onAddButtonClick(event)
            }
        })
        
        this.newTaskAboutInputElement.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.onAddButtonClick(event)
            }
        })

        this.newTaskTitleInputElement.addEventListener('input', () => {
            this.newTaskTitleInputElement.style.border = ''
        })
        
        this.newTaskAboutInputElement.addEventListener('input', () => {
            this.newTaskAboutInputElement.style.border = ''
        })

        this.listElement.addEventListener('click', this.handleTaskClick);
    }
}

new ToDo()