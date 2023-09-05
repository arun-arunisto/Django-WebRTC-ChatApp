//console.log("Hello World!!")
var labelUsername = document.querySelector("#label-username");
var loc = window.location;
var webSocket;

//function to receive data from our consumers.py file
function webSocketOnMessage(event) {
    var parsedData = JSON.parse(event.data);
    var message = parsedData['message']
    console.log('message: ',message);
}

console.log(labelUsername.textContent);
var wsStart = "ws://";
if (loc.protocol == 'https:') {
    wsStart = "wss://";
}

var endPoint = wsStart + loc.host + loc.pathname;
console.log("endPoint: ",endPoint);

webSocket = new WebSocket(endPoint);

webSocket.addEventListener('open', (e) => {
    console.log("Connection Opened!");
    var jsonStr = JSON.stringify({
        'message': 'This is a message',
    });
    webSocket.send(jsonStr);
});
webSocket.addEventListener('message', webSocketOnMessage);
webSocket.addEventListener('close', (e) => {
    console.log("Connection Closed!");
});
webSocket.addEventListener('error', (e) => {
    console.log("Error Occurred!");
});

