require("dotenv").config();
const { app } = require("./app");
const { envConfig } = require("./src/config/config");
const { connectdb } = require("./src/dbconfig/db");
const { adminSeeder } = require("./adminseeder");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { User } = require("./src/models/user.models");
const { default: mongoose } = require("mongoose");

const {
  getOrCreateConversation,
} = require("./src/services/getOrCreateConversation");
const { Message } = require("./src/models/message.models");

const server = http.createServer(app);

const io = new Server(server, {
  cors: "*",
});

let onlineUsers = [];
let addToOnlineUsers = (socketId, userId, role) => {
  onlineUsers = onlineUsers.filter((user) => user.userId !== userId);
  onlineUsers.push({ socketId, userId, role });
};

io.on("connection", (socket) => {
  // console.log("user connected", socket.id);
  // console.log("socket : ", socket);
  const token = socket.handshake.headers.token;
  // console.log(token, "token");
  if (token) {
    jwt.verify(token, envConfig.tokensecret, async (err, result) => {
      if (err) {
        socket.emit("error", err);
      } else {
        // console.log(`result  :`, result);
        const userData = await User.findOne({
          _id: new mongoose.Types.ObjectId(result._id),
        });

        // console.log(`userData : `, userData);
        // console.log(socket.id);
        if (!userData) {
          socket.emit("error", "No user found with that token");
          return;
        }

        //we have to add userid
        addToOnlineUsers(socket.id, result._id, userData.role);
        // console.log(onlineUsers);

        //fetch and send undelivered messages
        const undeliveredMessages = await Message.find({
          receiver: result._id,
          status: "sent",
        });

        const userSocket = onlineUsers.find(
          (user) => user.userId === result._id
        );
        if (userSocket) {
          io.to(userSocket.socketId).emit(
            "receiveOfflineMessages",
            undeliveredMessages
          );
        }

        await Message.updateMany(
          { receiver: result._id, status: "sent" },
          { $set: { status: "delivered" } }
        );

  2
      }
    });
  } else {
    socket.emit("error", "please provide token");
  }

  socket.on("sendMessage", async (data) => {
    const { receiver, message } = data;
    // console.log(`data :${data}`);
    const senderUser = onlineUsers.find((user) => user.socketId === socket.id);
    // console.log(senderUser);
    if (!senderUser) {
      socket.emit("error", "user not authenticated");
      return;
    }
    const sender = senderUser.userId;
    // console.log("receiver id is : ", receiver);
    const conversationId = await getOrCreateConversation(sender, receiver);

    console.log("conversationid is :", conversationId);

    //save message into the database
    const newMessage = await Message.create({
      conversationId,
      sender,
      receiver,
      message,
      status: "sent",
    });
    const receiverSocket = onlineUsers.find((user) => user.userId === receiver);
    // console.log(receiverSocket);
    if (receiverSocket) {
      io.to(receiverSocket.socketId).emit("receiveMessage", newMessage);
      console.log(`message sent to receiver: ${receiver}`);
    }
  });
});

adminSeeder();
server.listen(envConfig.port, () => {
  console.log(`server is listening at port ${envConfig.port}`);
  connectdb();
});
