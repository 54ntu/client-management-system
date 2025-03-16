const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { ChatController } = require("../controller/chat.controller");
const chatRouter = express.Router();

chatRouter
  .route("/get-chat-history/:id")
  .get(UserMiddleware.isUserLoggedIn, ChatController.getChatHistory);

module.exports = {
  chatRouter,
};
