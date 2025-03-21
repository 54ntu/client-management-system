const mongoose = require("mongoose");
const { paymentStatus, paymentMethods } = require("../global");

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
      enum: [
        paymentMethods.khalti,
        paymentMethods.stripe,
        paymentMethods.credit,
      ],
    },
    paymentStatus: {
      type: String,
      enum: [paymentStatus.completed, paymentStatus.pending],
      default: paymentStatus.pending,
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
