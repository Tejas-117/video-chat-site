const express = require("express");
const app = express();
const httpServer = require("http").createServer(app);
const socketIO = require("socket.io");
const ejs = require("ejs");
const url = require("url");
const { v4: uuidV4 } = require("uuid");
const { ExpressPeerServer } = require("peer");

const room = require("./utils/room");

// socket server
const io = new socketIO.Server(httpServer);

// peer server
const peerServer = ExpressPeerServer(httpServer, {
  debug: true,
  allow_discovery: true,
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, name, id) => {
    // if room is not found return;
    if (room.addUser(roomId, name, id) == null) {
      socket.emit("room-not-found");
      return;
    }
    
    socket.join(roomId);
    io.in(roomId).emit("allUsers", room.getAllUsers(roomId)); // to update all users
    io.in(roomId).emit("call-user", id, name);

    socket.to(roomId).emit("send-message", {
      // send message to clients
      user: "BOT",
      message: `${name}, joined room.`,
      time: new Date().toLocaleTimeString("en-US"),
      type: `dispatch join`,
    });

    socket.on("disconnect", () => {
      room.removeUser(roomId, id);
      socket.to(roomId).emit("user-disconnected", id);

      io.in(roomId).emit("allUsers", room.getAllUsers(roomId));
      socket.to(roomId).emit("send-message", {
        user: "BOT",
        message: `${name}, left room.`,
        time: new Date().toLocaleTimeString("en-US"),
        type: `dispatch end`,
      });
    });

    //////////////////// chat messages ////////////////////////////
    socket.on("message", (data) => {
      io.in(roomId).emit("send-message", data);
    });
  });
});

// middleware
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use("/peerjs", peerServer);

// routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/room/:roomId", (req, res) => {
  const roomId = req.params.roomId;
  const currentRoom = room.getRoom(roomId);

  if (!currentRoom) return res.send("Room Not Found!!");

  return res.render("room", { roomName: currentRoom[0], roomId, port });
});

app.post("/create-room", (req, res) => {
  const { name } = req.body;
  const id = uuidV4();

  room.setRoom(id, name);

  res.redirect(`/room/${id}`);
});

app.post("/join-room/", (req, res) => {
  const urlPath = url.parse(req.body.roomUrl);
  res.redirect(`${urlPath.pathname}`);
});

app.use((err, req, res, next) => {
  res.send(`Internal Server Error`);
});

app.get("*", (req, res) => {
  res.send("Page Not Found");
});

const port = process.env.PORT || 3000;
httpServer.listen(port, () => console.log(`Server running on ${port}`));