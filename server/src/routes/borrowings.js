const express = require('express');
const BorrowingController = require('../controllers/borrowingController');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all borrowings (all roles)
router.get('/', BorrowingController.getAll);

// Get borrowing by ID (all roles)
router.get('/:id', BorrowingController.getById);

// Get active borrowings (all roles)
router.get('/reports/active', BorrowingController.getActive);

// Get borrowings by date range (all roles)
router.get('/reports/date-range', BorrowingController.getByDateRange);

// Create new borrowing (admin and super_admin)
router.post('/', authorize('admin', 'super_admin'), BorrowingController.create);

// Return borrowed item (admin and super_admin)
router.put('/:id/return', authorize('admin', 'super_admin'), BorrowingController.returnItem);

module.exports = router;