const express = require('express');
const router = express.Router();
const { register, login, savePushToken } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/push-token', protect, savePushToken);

module.exports = router;
