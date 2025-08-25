const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);

// Protected routes
router.get('/me', authenticateToken, AuthController.me);

// Super admin only routes
router.post('/register', authenticateToken, authorize('super_admin'), AuthController.register);

module.exports = router;