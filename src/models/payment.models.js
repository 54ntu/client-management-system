const mongoose = require("mongoose");
const { paymentMethod, paymentStatus } = require("../global");

const paymentSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },
    amount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: [paymentMethod.khalti, paymentMethod.stripe, paymentMethod.credit],
    },
    paymentStatus: {
      type: String,
      enum: [paymentStatus.completed, paymentStatus.pending],
    },
    pidx: {
      type: String,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = {
  Payment,
};
