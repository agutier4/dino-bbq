function connectSocket(endpoint){
    if (socket !== undefined) {
        socket.close()
    }

    socket = new WebSocket(endpoint);

    socket.onmessage = function(event) {
        console.log("Message:" + event.data);
    }

    socket.onopen = function(evt) {
        console.log("WebSocket opened");
    };

    socket.onclose = function(evt) {
        console.log("WebSocket closed");
    };

    socket.onerror = function(evt) {
        console.log("WebSocket Error");
    };

    return socket;
}

function sendMsg() {
    var message = document.getElementById("myMessage").value;
    socket.send(message);
}

function closeSocket() {
    socket.close();
}

const socketUrl = 'ws://'+location.host
var socket = connectSocket(socketUrl);