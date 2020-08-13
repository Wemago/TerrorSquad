// Connection with socket
let socket = io.connect("/");

document.addEventListener("DOMContentLoaded", function() {
    socket.emit('todoList'); // we launch the "event" for newUser
});

function writeTodoList(todoList) {
    let todo = '',
        done = '';
    todoList.sort(function(a, b) { // we sort by ID descending
        return b.id - a.id;
    });
    todoList.forEach(function(item, index) {
        if (item.done == false) {
            todo = todo + '<div class="task task-todo"><a id="' + item.id + '" data-done="false"><i class="fa fa-square-o" aria-hidden="true"></i></a> <span class="task-item"><span class="user-name">' + item.user + '</span> ' + item.desc + '</span></div>';
        } else if (item.done == true) {
            done = done + '<div class="task task-done"><a id="' + item.id + '" data-done="true"><i class="fa fa-check-square-o" aria-hidden="true"></i></a> <span class="task-item"><span class="user-name">' + item.user + '</span> ' + item.desc + '</span></div>';
        }
    });
    document.querySelector('#todo').innerHTML = todo;
    document.querySelector('#done').innerHTML = done;
}

function addCheckboxToEventListener() {
    let checkbox = document.querySelectorAll('a[data-done]');
    /* ES6 notation */
    Array.from(checkbox).forEach(item => {
        item.addEventListener('click', function(event) {
            event.preventDefault();
            socket.emit('actionTask', this.id);
        });
    });
}

// we ask for an alias to the new user
let alias = '';
do {
    alias = prompt('Choose an alias, please ?'); // we ask for an alias
} while (alias == '');
document.title = alias + ' | ' + document.title; // we update title page

// Submit a new addTask
document.querySelector('#task-form').addEventListener('submit', function(event) {
    event.preventDefault();
    let task = {};
    task.user = alias;
    task.desc = document.querySelector('#new-task').value; // we read the message from the input
    socket.emit('addTask', task); // we launch the broadcast event to inform other user
    document.querySelector('#new-task').value = ''; // we empty the input
    document.querySelector('#new-task').focus();
})

// Update todoList when we receive an event
socket.on('transmitTodoList', function(todoList) {
    writeTodoList(todoList);
    addCheckboxToEventListener();
});