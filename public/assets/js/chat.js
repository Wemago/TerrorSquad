const socket = io('/')

console.log('Made socket connection', socket)

const videoGrid = document.getElementById('video-grid')

const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})

const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)

    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

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