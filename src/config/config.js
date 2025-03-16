const envConfig = {
  port: process.env.PORT || 8000,
  mongodburl: process.env.MONGODB_URL,
  adminemail: process.env.ADMIN_EMAIL,
  adminpassword: process.env.ADMIN_PASSWORD,
  tokensecret: process.env.TOKEN_SECRET,
  tokenexpiry: process.env.TOKEN_EXPIRY,
  node_env: process.env.NODE_ENV,

  //cloudinary setup
  cloudname: process.env.CLOUD_NAME,
  apikey: process.env.API_KEY,
  apisecret: process.env.apisecret,
};

module.exports = {
  envConfig,
};
