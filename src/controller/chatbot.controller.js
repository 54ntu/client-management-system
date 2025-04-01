const { validationResult } = require("express-validator");
const chatbotServices = require("../services/chatbotServices");
class ChatbotController {
  static async processMessage(req, res) {
    try {
      //validate the input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "invalid input",
          details: errors.array(),
        });
      }

      const { message } = req.body;
      const userid = req.user?._id;
      // console.log(req.user.role);
      if (!message) {
        return res.status(400).json({
          success: false,
          message: "message is required",
        });
      }

      const response = await chatbotServices.processMessage(message, userid);

      return res.status(200).json({
        originalMessage: message,
        data: response,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = {
  ChatbotController,
};
