const rooms = {};

// get user from their id
function getUser(roomId, id){
   const users = rooms[roomId];

   if(!users) return;

   for (const user of users.slice(1)) {
      if(user.id == id){
         return user;
      }
   }
}

// get all users in particular room
function getAllUsers(roomId){
   if(rooms[roomId]){
      return rooms[roomId].slice(1);
   }
}

// add user to a room
function addUser(roomId, name, id){
    if(!rooms[roomId]){
      return null;
    }

    rooms[roomId].push({ name, id });
    return rooms[roomId].slice(1);
}

// remove user from a room
function removeUser(roomId, id){
   const arr = rooms[roomId];

   if(!arr) return;

   arr.forEach((user, i) => {
      if(user.id === id){
         arr.splice(i, 1);
         return;
      }
   });
}

function getRoom(roomId){
   return rooms[roomId];
}

function setRoom(roomId, roomName){
   const oneDay = 24 * 60 * 60 * 1000;
   const deleteTime = setTimeout(deleteRoom, oneDay, roomId);

   rooms[roomId] = [roomName];
}

// delete room
function deleteRoom(roomId){
   const keys = Object.keys(rooms);
   keys.forEach(key => {
      if(key === roomId){
         delete rooms[roomId];
         return;
      }
   })
}

module.exports = {
   getUser,
   getAllUsers,
   addUser,
   removeUser,
   getRoom,
   setRoom,
   deleteRoom
}