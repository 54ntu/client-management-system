const jwt = require("jsonwebtoken");
const { envConfig } = require("../config/config");

class UserMiddleware {
  static async isUserLoggedIn(req, res, next) {
    try {
      const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer", "").trim();

      if (!token) {
        return res.status(400).json({
          message: "please login first",
        });
      }

      try {
        const decodedToken = jwt.verify(token, envConfig.tokensecret);
        req.user = decodedToken;
        next();
      } catch (error) {
        return res.status(401).json({
          message: "invalid or expired token",
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }

  static async isAdmin(req, res, next) {
    if (!req.user) {
      return res.status(400).json({
        error: "req.user not provided",
      });
    }

    if (req.user?.role == "admin" || req.user?.role == "conversion_committee") {
      next();
    } else {
      return res.status(403).json({
        message: "only admin or conversion_committee can perform this task",
      });
    }
  }

  static async isClient(req, res, next) {
    if (!req.user) {
      return res.status(403).json({
        message: "req.user is required",
      });
    }
    if (req.user?.role == "client") {
      next();
    } else {
      return res.status(403).json({
        message: "client can only perform this task",
      });
    }
  }

  static async isEmployee(req, res, next) {
    if (!req.user) {
      return res.status(400).json({
        error: "user role is required..!!",
      });
    }

    if (req.user?.role == "employee") {
      next();
    } else {
      return res.status(403).json({
        message: "only employee can perform this operation",
      });
    }
  }

  static async isCR(req, res, next) {
    if (!req.user) {
      return res.status(400).json({
        error: "user role is required..!!",
      });
    }

    if (req.user?.role == "customer_representative") {
      next();
    } else {
      return res.status(403).json({
        message: "only customer_representative can perform this operation",
      });
    }
  }
}

module.exports = {
  UserMiddleware,
};
