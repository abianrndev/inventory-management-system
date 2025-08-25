const express = require('express');
const ItemController = require('../controllers/itemController');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all items (all roles)
router.get('/', ItemController.getAll);

// Get item by ID (all roles)
router.get('/:id', ItemController.getById);

// Get low stock items (all roles)
router.get('/reports/low-stock', ItemController.getLowStock);

// Create new item (admin and super_admin)
router.post('/', authorize('admin', 'super_admin'), ItemController.create);

// Update item (admin and super_admin)
router.put('/:id', authorize('admin', 'super_admin'), ItemController.update);

// Delete item (super_admin only)
router.delete('/:id', authorize('super_admin'), ItemController.delete);

// Update stock (internal use - admin and super_admin)
router.put('/:id/stock', authorize('admin', 'super_admin'), ItemController.updateStock);

module.exports = router;