const socket = io.connect()
const taskList = document.getElementById('task-list')
let taskListData = []

document.getElementById('add-task').addEventListener('keydown', function(e) {
    var value = this.value
    if (e.key === 'Enter' && value) {
        addItem(value)
    }
})

function addItem(value) {
    addItemToDOM(value)
    document.getElementById('add-task').value = ''
    taskListData.push(value)
    dataUpdate()
}

function removeItem() {
    let task = this.parentNode
    let parent = task.parentNode
    let value = task.childNodes[0].innerHTML
    taskListData.splice(taskListData.indexOf(value), 1)
    taskList.removeChild(task)
    dataUpdate()
}

function addItemToDOM(text) {

    let newTask = document.createElement('li')
    let listText = document.createElement('span')

    listText.classList.add('list-text')
    listText.innerText = text

    let supressTask = document.createElement('a')

    supressTask.classList.add('supress-task')
    supressTask.innerHTML = '✘'

    newTask.appendChild(listText)
    newTask.appendChild(supressTask)
    taskList.insertBefore(newTask, taskList.childNodes[0])

    // Add click event for removing item
    supressTask.addEventListener('click', removeItem)
}

function renderTodoList() {

    if (!taskListData) {
        return;
    }

    for (let i = 0; i < taskListData.length; i++) {
        let value = taskListData[i]
        addItemToDOM(value)
    }
}

function dataUpdate() {
    socket.emit('taskListToServer', taskListData)
}

function resetList() {
    while (taskList.firstChild) {
        taskList.removeChild(taskList.firstChild)
    }
}

socket.on('taskListFromServer', function(serverTaskList) {
    taskListData = serverTaskList
    resetList()
    renderTodoList()
})