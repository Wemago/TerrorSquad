const socket = io.connect(`http://localhost:5000/chat`);
console.log('Made socket connection', socket);

let message = document.getElementById('message')
let handle = document.getElementById('handle')
let btn = document.getElementById('send')
let output = document.getElementById('output')
let feedback = document.getElementById('feedback')

//emit events
btn.addEventListener('click', () => {
    socket.emit('chat', {
        message: message.value,
        handle: handle.value
    })
    message.value = "";
})

//when there's a person typing, we capture the 'typing' event along with the handle name of the user doing the typing.
message.addEventListener('keypress', () => {
    socket.emit('typing', handle.value)
})

//listening for events
socket.on('chat', (data) => {
    feedback.innerHTML = '';
    output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>'
})

socket.on('typing', (data) => {
    feedback.innerHTML = `<p><em> ${data} is typing a message... </em></p>`
})