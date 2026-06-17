const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/rbacMiddleware');

// Public
router.post('/login', login);

// Manager only
router.post('/register', authenticate, authorize('Manager'), register);

module.exports = router;
