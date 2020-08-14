var editor;
var code;

window.addEventListener("load", function () {
    code = document.getElementById('codePanel');
    editor = CodeMirror.fromTextArea(code, {
        lineNumbers: true,
        mode: "javascript",
        autCloseTags: true,
        extraKeys: {
            "Ctrl-Space": "autocomplete"
        },

    });
})

//var port = process.env.PORT || 3000;

const socket = io();

var submitBtn = document.getElementById("commitBtn");


document.addEventListener('keyup', function () {
    var codeEmit = editor.getValue();
    //console.log(codeBox.value);
    socket.emit('code', codeEmit)
});


//Listen for changes
socket.on('code', function (data) {
    editor.setValue(data);
});