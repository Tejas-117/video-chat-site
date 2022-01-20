const audioVal = document.getElementById('audio');
const videoVal = document.getElementById('video');

// audio / video choices are changed
function toggleMedia(event){
  const audioTracks = localStream.getAudioTracks();
  const videoTracks = localStream.getVideoTracks();

  // disable de-selected media;
  audioTracks[0].enabled = audioVal.checked;
  videoTracks[0].enabled = videoVal.checked;

  toggleIcons();
}

const micIcons = Array.from(document.querySelectorAll('.mic'));
const cameraIcons = Array.from(document.querySelectorAll('.camera'));

function toggleIcons(){
   const audio = audioVal.checked + '';
   const video = videoVal.checked +  '';

   for(let i=0; i<micIcons.length; i++){
      micIcons[i].classList.add('hide');
      cameraIcons[i].classList.add('hide');

      if(micIcons[i].dataset.val == audio){
         micIcons[i].classList.remove('hide');
      }
      if(cameraIcons[i].dataset.val == video){
         cameraIcons[i].classList.remove('hide');
      }
   }
}

// redirect users to 'home' when they end the call;
function hangup(event){
   window.location = '/';
}

////////////////// chat functionality ////////////////////////
const chatContainer = document.querySelector('.chat-container');
const usersContainer = document.querySelector('.users-container');
const messageInput = document.getElementById("message");
const chatContent = document.querySelector('.chat-content');

function sendMessageToServer(event){
   event.preventDefault();

   const x = new Date();

   const data = {
      user: name,
      message: messageInput.value,
      time: x.toLocaleTimeString('en-US'),
      type: `message`,
   }
   socket.emit("message", data);  

   messageInput.value = "";
   messageInput.focus();
}

socket.on('send-message', (data) => {
   const html = `<div class="${data.type}">
                  <p class="meta">${data.user} <span>${data.time}</span></p>
                  <p class="text">${data.message}</p>
               </div>`
   chatContent.insertAdjacentHTML('beforeend', html);
   chatContent.scrollTop = chatContent.scrollHeight
})


///////////////////////////// other util functions /////////////////
socket.on("allUsers", (users) => {
   allUsers = users;

   const children = Array.from(usersContainer.children).slice(2);   
   children.forEach(child => child.remove());

   users.forEach(user => {
      const html = `<p class="user">${user.name}</p>`;
      usersContainer.insertAdjacentHTML('beforeend', html);
   })
})

function toggleChat(){
   chatContainer.classList.toggle('show-chat');
}

function toggleUsers(){
   usersContainer.classList.toggle('show-users');
}