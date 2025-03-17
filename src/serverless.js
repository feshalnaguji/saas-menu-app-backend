// src/serverless.js
const app = require(".");

// We do NOT call app.listen(...) here
// Instead we export a function for Vercel to call
module.exports = (req, res) => {
  if (req.url === "/test") {
    return res.status(200).send("Hello from test route");
  }
  // Vercel will pass incoming requests to this function
  return app(req, res);
};
