class ConversionCommitteePaymentController {
  static async projectOverviewDetails(req, res) {
    const userid = req.user?._id;
    if (!userid) {
      return res.status(401).json({
        success: false,
        message: "user id is required",
      });
    }

        

  }
}

module.exports = {
  ConversionCommitteePaymentController,
};
