const { default: mongoose, Mongoose, mongo } = require("mongoose");
const { Conversation } = require("../models/conversation.models");
const { Message } = require("../models/message.models");
const {
  getOrCreateConversation,
} = require("../services/getOrCreateConversation");

class ChatController {
  static async getChatHistory(req, res) {
    try {
      const receiverId = new mongoose.Types.ObjectId(req.user?._id);
      // console.log("receiver id is : ", typeof receiverId);
      let senderId = new mongoose.Types.ObjectId(req.params);

      // console.log("senderId : ", typeof senderId);
      const conversationId = await getOrCreateConversation(
        receiverId,
        senderId
      );
      // console.log(conversationId);

      if (!conversationId) {
        return res.status(500).json({
          success: false,
          message: "conversation establishment failed",
        });
      }

      const messages = await Message.find({ conversationId });
      // const message = await Message.find({ conversationId }).populate("sender");
      return res.status(200).json({ success: true, messages });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = {
  ChatController,
};
