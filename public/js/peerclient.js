const vidGrid = document.getElementById("video-grid");
const socket = io("/");
let name = localStorage.getItem("name");
let id;

while (!name) {
  name = prompt("Enter your name: ");
}

// default configuration is sufficient
const peer = new Peer();

peer.on("open", (peerId) => {
  id = peerId;
  start();
});

let localStream = null;
let allUsers = [];
const allMediaConn = {};

async function start() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
  } catch (error) {
    alert("Couldn't get media devices");
    location.reload();
  }
  
  const vidContainer = getContainer(name);
  const myVideo = document.createElement("video");
  myVideo.muted = true;
  
  addVideo(myVideo, vidContainer, localStream);

  // join room only after getting media;
  socket.emit("join-room", roomId, name, id);
}

socket.on("call-user", callNewUser);
peer.on("call", answerCall);

// call the peer that joined same room;
function callNewUser(peerId, peerName) {
  console.log(peerId == id);
  if(peerId == id) return;

  const call = peer.call(peerId, localStream);
  allMediaConn[peerId] = call;

  const video = document.createElement("video");
  const vidContainer = getContainer(peerName);

  call.on("stream", (remoteStream) => {
    addVideo(video, vidContainer, remoteStream);
  });

  call.on("close", () => {
    video.remove();
    vidContainer.remove();
  });
}

// answer call from other peer.
function answerCall(call) {
  call.answer(localStream);
  allMediaConn[call.peer] = call;

  const peerObj = allUsers.find((user) => user.id === call.peer);
  const video = document.createElement("video");
  const vidContainer = getContainer(peerObj.name);

  call.on("stream", (remoteStream) => {
    addVideo(video, vidContainer, remoteStream);
  });

  call.on("close", () => {
    video.remove();
    vidContainer.remove();
  });
}

// remove user on diconnection
socket.on("user-disconnected", (peerId) => {
  if (allMediaConn[peerId]) {
    allMediaConn[peerId].close();
  }
});

socket.on("room-not-found", () => {
  alert("Room Not Found");
  window.location = "/";
});

///////////////////////// util functions ////////////////////////
function getContainer(name) {
  const vidContainer = document.createElement("div");
  vidContainer.className = `video-container`;

  const displayName = document.createElement("p");
  displayName.className = `display-name`;
  displayName.innerText = name;

  vidContainer.append(displayName);
  return vidContainer;
}

// add stream to video element and append to DOM.
function addVideo(video, vidContainer, stream) {
  video.srcObject = stream;

  video.addEventListener("loadedmetadata", () => {
    video.play();
  });

  vidContainer.prepend(video);
  vidGrid.append(vidContainer);
}