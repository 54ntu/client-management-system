const { User } = require("../models/user.models");
const { Conversion } = require("../models/conversionCommittee.models");
const {
  comparedPassword,
  hashPassword,
} = require("../services/authcontroller");
const jwt = require("jsonwebtoken");
const { envConfig } = require("../config/config");
const { ApiResponse } = require("../services/Apiresponse");
const { default: mongoose } = require("mongoose");

class UserController {
  static async addConversionCommitte(req, res) {
    try {
      //admin will registered conversion committee
      const adminid = req.user._id;
      if (!adminid) {
        return res.status(400).json({
          message: "admin is not logged in",
        });
      }

      const profileImage = req.file?.filename;
      //get the conversion committee details from the req.body
      const { name, email, password, role, phone, address } = req.body;
      if (!name || !email || !password || !role || !phone || !address) {
        return res.status(400).json({
          message: "all fields are required",
        });
      }

      //validate email and phone
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format." });
      }

      if (phone.length !== 10) {
        return res
          .status(400)
          .json({ error: "Phone number must be exactly 10 digits." });
      }

      //check whether the conversion committee with the given email exists or not
      const findCommittee = await User.findOne({ email });
      if (findCommittee) {
        return res.status(400).json({
          message: "conversion committee with given email already exists",
        });
      }

      const hashedpassword = await hashPassword(password);

      const newuser = await User.create({
        name,
        email,
        phone,
        role,
        password: hashedpassword,
        address,
        profileImage,
      });

      if (!newuser) {
        return res.status(500).json({
          message: "user creation failed",
        });
      }

      const newConversionCommittee = await Conversion.create({
        user: newuser._id,
        admin: new mongoose.Types.ObjectId(adminid),
      });

      if (!newConversionCommittee) {
        return res.status(500).json({
          message: "conversion committee creation failed",
        });
      }

      return res.status(201).json(
        new ApiResponse(
          201,
          {
            conversion_committee_name: newuser.name,
            conversion_committee_email: newuser.email,
            conversion_committe_phone: newuser.phone,
            conversion_committe_role: newuser.role,
            conversion_committe_address: newuser.address,
            conversion_committee_profile: newuser.profileImage,
          },
          "conversion committee created successfully"
        )
      );
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }

  static async viewConversionCommittee(req, res) {
    try {
      const adminId = req.user._id;
      if (!adminId) {
        return res.status(400).json({
          message: "admin id is required",
        });
      }

      const conversioncommitteeData = await Conversion.aggregate([
        {
          $match: {
            admin: new mongoose.Types.ObjectId(adminId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "conversionCommitteeDetails",
          },
        },
        {
          $unwind: "$conversionCommitteeDetails",
        },
        {
          $project: {
            _id: 1,
            name: "$conversionCommitteeDetails.name",
            email: "$conversionCommitteeDetails.email",
            role: "$conversionCommitteeDetails.role",
            phone: "$conversionCommitteeDetails.phone",
            status: "$conversionCommitteeDetails.status",
            profileImage: "$conversionCommitteeDetails.profileImage",
            address: "$conversionCommitteeDetails.address",
          },
        },
      ]);

      // console.log(conversioncommitteeData);

      if (!conversioncommitteeData || conversioncommitteeData.length === 0) {
        return res.status(404).json({
          message: "data not found",
        });
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            conversioncommitteeData,
            "data fetched successfully"
          )
        );
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }

  static async login(req, res) {
    try {
      //get the email and password from the req.body
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "email and password is required",
        });
      }

      //check whether the user with given email exist or not
      const userExist = await User.findOne({ email });

      if (!userExist) {
        return res.status(404).json({
          success: false,
          message: "user with given email doesnot exist",
        });
      }

      console.log(`client role is : ${userExist.role}`);
      //compare the password
      const response = await comparedPassword(password, userExist.password);
      if (!response) {
        return res.status(400).json({
          success: false,
          message: "email or password doesnot matched",
        });
      }

      //generate accessToken
      const accessToken = await jwt.sign(
        {
          _id: userExist._id,
          email: userExist.email,
          role: userExist.role,
        },
        envConfig.tokensecret,
        {
          expiresIn: envConfig.tokenexpiry,
        }
      );

      //before setting the accessToken into the cookies we need to define options
      const options = {
        httpOnly: true,
        secure: envConfig.node_env === "production",
        sameSite: "strict",
      };

      return res.status(200).cookie("accessToken", accessToken, options).json({
        message: "user logged in successfully",
        accessToken,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async logout(req, res) {
    //set cookie options for secure and httpOnly cookies
    try {
      const options = {
        httpOnly: true,
        secure: envConfig.node_env === "production",
      };

      //clear access token cookies from the client's browser
      return res
        .status(200)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, {}, "user logged out successfully"));
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = {
  UserController,
};
