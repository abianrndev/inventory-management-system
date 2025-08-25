const express = require('express');
const ReceivingController = require('../controllers/receivingController');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all receivings (all roles)
router.get('/', ReceivingController.getAll);

// Get receiving by ID (all roles)
router.get('/:id', ReceivingController.getById);

// Get pending receivings (all roles)
router.get('/reports/pending', ReceivingController.getPending);

// Get receivings by date range (all roles)
router.get('/reports/date-range', ReceivingController.getByDateRange);

// Create new receiving (admin and super_admin)
router.post('/', authorize('admin', 'super_admin'), ReceivingController.create);

// Approve/reject receiving (super_admin only)
router.put('/:id/approve', authorize('super_admin'), ReceivingController.updateApproval);

module.exports = router;