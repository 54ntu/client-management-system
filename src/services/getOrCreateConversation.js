const { Conversation } = require("../models/conversation.models");

const getOrCreateConversation = async (senderId, receiverId) => {
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });
  if (!conversation) {
    conversation = new Conversation({
      participants: [senderId, receiverId],
    });
    await conversation.save();
  }
  return conversation._id;
};

module.exports = {
  getOrCreateConversation,
};
