// src/serverless.js
const app = require("./app");

// We do NOT call app.listen(...) here
// Instead we export a function for Vercel to call
module.exports = (req, res) => {
  // Vercel will pass incoming requests to this function
  return app(req, res);
};
