// src/controllers/statusController.js
exports.getStatus = (req, res) => {
  res.json({
    status: "Online",
    message: "AWS Backend is reachable!",
    owner: "Mark Carroll",
    timestamp: new Date()
  });
};