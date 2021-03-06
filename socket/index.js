const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors : {
    origin : "*",
  },
})


let users = [];
let roomMembers = {};

const addUser = (username, socketId, roomId = null) => {
  !users.some(user => user.username === username) &&
    users.push({ username, socketId, roomId })
};

const removeUser = (socketId) => {
  users = users.filter(user => user.socketId !== socketId);
};

const getUser = username => {
  return users.find(user => user.username === username)
};

io.on("connection", socket => {
  io.emit("firstEvent", "hello this is test")    
  
  socket.on("addUser", username => {
    console.log(`${username} connected`)
    addUser(username, socket.id);
    io.emit("getUsers", users)
  });

  socket.on("sendMessage", ({roomId, senderUsername, text}) => {
    io.to(roomId).emit("getMessage", { roomId, senderUsername, text })
  })

  socket.on("joinRoom", ({roomId, username}) => {
    socket.join(roomId)
    if(!roomMembers[roomId]) {
      roomMembers[roomId] = {
        roomId : roomId,
        members : [username]
      }
    } 
    else if(!roomMembers[roomId].members.includes(username)) {
      roomMembers[roomId].members.push(username)
    }
    console.log(roomMembers[roomId])
    io.to(roomId).emit("user-joined", roomMembers[roomId])
  }) 
    
  socket.on("disconnect", () => {
    console.log("a user disconnected");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });

  socket.on("leaveRoom", ({ roomId, username}) => {
    socket.leave(roomId);
    roomMembers[roomId].members = roomMembers[roomId].members.filter(u => u !== username);
    if(roomMembers[roomId].members.length === 0) {
      delete roomMembers[roomId]
    }
    console.log(`${username} left ${roomId}`)
  })

  socket.on("typing", ({ senderUsername, roomId }) => {
    console.log(`${senderUsername} is typing`);
    io.to(roomId).emit("getTyping", true)
  });

  socket.on("done-typing", (roomId) => {
    io.to(roomId).emit("done-typing", false)
  });

  socket.on("sendNotification", ({ senderName, receiverName, returnedAPIResponse}) => {
    console.log(senderName, receiverName, returnedAPIResponse);
    if(senderName === receiverName) return;
    const receiver = getUser(receiverName);
    if(!receiver) return;
    io.to(receiver.socketId).emit("getNotification", returnedAPIResponse )
  })
});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
httpServer.listen(process.env.PORT || 8900)