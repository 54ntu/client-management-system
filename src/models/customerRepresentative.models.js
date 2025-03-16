const mongoose = require("mongoose");
const customerRepSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    conversion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversion",
    },
  },
  { timestamps: true }
);

const CR = mongoose.model("CR", customerRepSchema);
module.exports = { CR };
