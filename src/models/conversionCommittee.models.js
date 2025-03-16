const mongoose = require("mongoose");

const conversionCommitteeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Conversion = mongoose.model("Conversion", conversionCommitteeSchema);
module.exports = {
  Conversion,
};
