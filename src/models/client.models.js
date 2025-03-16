const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  conversion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversion",
  },
  lastInteractionDate: {
    type: Date,
    default: Date.now,
  },
  nextSession: {
    type: Date,
  },
});

const Client = mongoose.model("Client", clientSchema);
module.exports = { Client };
