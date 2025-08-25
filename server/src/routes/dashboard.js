const express = require('express');
const DashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticateToken);

// Get dashboard statistics
router.get('/stats', DashboardController.getStats);

// Get monthly trends
router.get('/trends', DashboardController.getMonthlyTrends);

module.exports = router;