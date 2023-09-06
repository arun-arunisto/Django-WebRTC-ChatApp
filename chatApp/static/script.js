//console.log("Hello World!!")
var labelUsername = document.querySelector("#label-username");
var loc = window.location;
var webSocket;
var username = labelUsername.textContent;
var mapPeers = {};


//function to receive data from our consumers.py file
function webSocketOnMessage(event) {
    var parsedData = JSON.parse(event.data);
    var peerUsername = parsedData['peer'];
    var action = parsedData['action'];
    if (username == peerUsername) {
        return;
    }

    var receiver_channel_name = parsedData['message']['receiver_channel_name'];

    if (action == 'new-peer') {
        createOfferer(peerUsername, receiver_channel_name);
        return;
    }
}

console.log(username);
var wsStart = "ws://";
if (loc.protocol == 'https:') {
    wsStart = "wss://";
}

var endPoint = wsStart + loc.host + loc.pathname;
console.log("endPoint: ",endPoint);

webSocket = new WebSocket(endPoint);

webSocket.addEventListener('open', (e) => {
    console.log("Connection Opened!");
    // when a connection is open we are going to send signal
    sendSignal('new-peer', {});
});
webSocket.addEventListener('message', webSocketOnMessage);
webSocket.addEventListener('close', (e) => {
    console.log("Connection Closed!");
});
webSocket.addEventListener('error', (e) => {
    console.log("Error Occurred!");
});

//Accessing media(Video and Audio)
var localStream = new MediaStream();

const constraints = {
    'video': true,
    'audio': true
};

const localVideo = document.querySelector('#local-video');

var userMedia = navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
        localStream = stream;
        localVideo.srcObject = localStream;
        localVideo.muted = true;
    })
    .catch(error => {
        console.log("Error: ", error);
    });


// function to send signal to server when connection is open
function sendSignal(action, message) {
    var jsonStr = JSON.stringify({
        'peer':username,
        'action': action,
        'message': message,
    });
    webSocket.send(jsonStr);
}

//function to connect peers over network
function createOfferer(peerUsername, receiver_channel_name) {
    //it will only connect in same network it will not connect different n/w
    //that's why we initialize null value
    var peer = new RTCPeerConnection(null);

    //adding local audio/video to peer
    addLocalTracks(peer);

    //for chat messages we are not going to use websockets
    //for that we are going to initialize data channels like below
    var dc = peer.createdDataChannel('channel');
    dc.addEventListener('open', () => {
        console.log('Connection Opened!');
    });
    dc.addEventListener('message', dcOnMessage);

    //creating remote video for remote peer
    var remoteVideo = createVideo(peerUsername);

    //creating audio for remote peer
    setOnTrack(peer, remoteVideo);

    mapPeers[peerUsername] = [peer, dc];

    peer.addEventListener('iceconnectionstatechange', () => {
        var iceConnectionState = peer.iceConnectionState;

        if (iceConnectionState === 'failed' || iceConnectionState === 'disconnected' || iceConnectionState === 'closed') {
            delete mapPeers[peerUsername];

            if (iceConnectionState != 'closed') {
                peer.close();
            }

            removeVideo(remoteVideo);
        }
    });

    peer.addEventListener('icecandidate', (event) => {
        if(event.candidate) {
            console.log('New ice candidate: ',JSON.stringify(peer.localDescription));

            return;
        }

        sendSignal('new-offer', {
            'sdp': peer.localDescription,
            'receiver_channel_name': receiver_channel_name
        });
    });

    peer.createOffer()
        .then(o => peer.setLocalDescription(o))
        .then(() => {
            console.log('Local description set successfully.');
        });
}

//function to add local tracks to peer
function addLocalTracks(peer){
    localStream.getTracks().forEach(track => {
        peer.addTrack(track, localStream);
    });

    return;
}

var messageList = document.querySelector('#message-list')
//function for chat message
function dcOnMessage(event){
    var message = event.data;

    var li = document.createElement('li');
    li.appendChild(document.createTextNode(message));
    messageList.appendChild(li);
}

//function to get video from html and it will assign
//to different peer user when everytime connects
function createVideo(peerUsername) {
    var videoContainer = document.querySelector('#video-container');
    var remoteVideo = document.createElement('video');

    remoteVideo.id = peerUsername + '-video';
    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true;

    var videoWrapper = document.createElement('div');
    videoContainer.appendChild(videoWrapper);
    videoWrapper.appendChild(remoteVideo);
    return remoteVideo;
}

//function for audio
function setOnTrack(peer, remoteVideo) {
    var remoteStream = new MediaStream();

    remoteVideo.srcObject = remoteStream;

    peer.addEventListener('track', async (event) => {
        remoteStream.addTrack(event.track, remoteStream);
    });
}

//function for remove video
function removeVideo(video) {
    var videoWrapper = video.parentNode;

    videoWrapper.parentNode.removeChild(videoWrapper);
}


