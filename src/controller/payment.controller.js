const { default: mongoose } = require("mongoose");
const { Payment } = require("../models/payment.models");
const { paymentMethods, paymentStatus } = require("../global");
const { default: axios } = require("axios");
const { Invoice } = require("../models/invoice.models");

class PaymentController {
  static async makePayment(req, res) {
    try {
      const invoiceId = req.params;
      // console.log(invoiceId);

      const client = req.user?._id;

      const { amount, paymentMethod } = req.body;
      const paymentMade = await Payment.create({
        clientId: new mongoose.Types.ObjectId(client),
        invoiceId: new mongoose.Types.ObjectId(invoiceId),
        amount,
        paymentMethod,
      });

      //   console.log("amount : ", amount);

      if (paymentMethod === paymentMethods.khalti) {
        const data = {
          return_url: "http://localhost:5173",
          website_url: "http://localhost:5173",
          amount: amount * 100,
          purchase_order_id: paymentMade._id,
          purchase_order_name: "payment " + paymentMade._id,
        };

        //this will give us the payment url and pidx
        const response = await axios.post(
          "https://dev.khalti.com/api/v2/epayment/initiate/",
          data,
          {
            headers: {
              Authorization: "key f1b854113d2c424f820427cadb100265",
            },
          }
        );

        //   console.log("response value is : ", response);
        const khaltiresponse = response.data;
        paymentMade.pidx = khaltiresponse.pidx;
        await paymentMade.save();

        return res.status(200).json({
          success: true,
          data: khaltiresponse,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async verifyPayment(req, res) {
    const { pidx } = req.body;
    //get the session id from req.query
    const { session_id } = req.query;
    let khaltiresponse = {};
    let session = {};

    if (pidx) {
      try {
        const response = await axios.post(
          "https://dev.khalti.com/api/v2/epayment/lookup/",
          { pidx: pidx },
          {
            headers: {
              Authorization: "key f1b854113d2c424f820427cadb100265",
            },
          }
        );

        // console.log(response);
        khaltiresponse = response.data;
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "error verifying payment with khalti",
          error: error.message,
        });
      }
    }

    // console.log("khaltiresponse : ", khaltiresponse);
    if (khaltiresponse.status === "Completed") {
      await Payment.findOneAndUpdate(
        {
          pidx: pidx,
        },
        {
          paymentStatus: "completed",
        },
        {
          new: true,
        }
      );
    }
  }
}

module.exports = {
  PaymentController,
};
