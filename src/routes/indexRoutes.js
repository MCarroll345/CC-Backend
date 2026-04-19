const express = require('express');
const router = express.Router();

router.get('/api/status', (req, res) => {
  res.json({
    status: 'Online',
    message: 'AWS Backend is reachable!',
    owner: 'Mark Carroll',
    timestamp: new Date()
  });
});

exports.routes = router;
