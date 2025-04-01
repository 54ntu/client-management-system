const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { ChatbotController } = require("../controller/chatbot.controller");
const chatbotRouter = express.Router();

chatbotRouter
  .route("/chatbot")
  .post(UserMiddleware.isUserLoggedIn, ChatbotController.processMessage);

module.exports = {
  chatbotRouter,
};
