const { default: mongoose } = require("mongoose");
const { Payment } = require("../models/payment.models");
const { paymentMethods, paymentStatus } = require("../global");
const { default: axios } = require("axios");
const { Invoice } = require("../models/invoice.models");
const { envConfig } = require("../config/config");
const Stripe = require("stripe");
const stripe = new Stripe(envConfig.stripe_key_secret);

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
      } else if (paymentMethod === paymentMethods.stripe) {
        const lineItems = [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "projectPayment",
              },
              unit_amount: amount * 100,
            },
            quantity: 1,
          },
        ];

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "payment",
          customer_email: req.user?.email,
          metadata: {
            paymentId: paymentMade._id.toString(),
          },
          success_url: "http://localhost:5173/success",
          cancel_url: "http://localhost:5173/cancel",
        });

        paymentMade.sessionId = session.id;
        await paymentMade.save();

        return res.status(200).json({
          success: true,
          sessionId: session.id,
          url: session.url,
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
    try {
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
      } else if (session_id) {
        try {
          //handle stripe verify-payment
          session = await stripe.checkout.sessions.retrieve(session_id);
          console.log("session ", session);
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: "error verifying payment with stripe",
            error: error.message,
          });
        }
      }

      // console.log("khaltiresponse : ", khaltiresponse);
      if (
        khaltiresponse.status === "Completed" ||
        session?.payment_status === "paid"
      ) {
        const updatedPayment = await Payment.findOneAndUpdate(
          {
            $or: [{ pidx: pidx }, { sessionId: session_id }],
          },
          {
            paymentStatus: "completed",
          },
          {
            new: true,
          }
        );

        console.log("updatedPayment : ", updatedPayment.invoiceId);

        const updatedInvoice = await Invoice.findOneAndUpdate(
          updatedPayment.invoiceId,
          {
            status: "completed",
          },
          {
            new: true,
          }
        );

        return res.status(200).json({
          success: true,
          data: {
            updatedPayment,
            updatedInvoice,
          },
          message: "payment verified successfully",
        });
      } else if (khaltiresponse.status === "Pending") {
        return res.status(403).json({
          success: false,
          message: "please make payment first",
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = {
  PaymentController,
};
