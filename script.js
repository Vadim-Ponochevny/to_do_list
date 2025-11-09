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
        console.log('ToDo app initialized!') 
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
            <li class="task__window">
                <div style="flex: 1; text-align:left;">
                    <h3>${title}</h3>
                    <p>${about}</p>
                </div>
                <button class="button__dell">
                    <img src="./assets/cross.svg" />
                </button>
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
}
}

new ToDo()