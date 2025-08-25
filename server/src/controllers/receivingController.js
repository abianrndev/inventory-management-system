const Receiving = require('../models/Receiving');
const Item = require('../models/Item');

class ReceivingController {
  // Get all receivings
  static async getAll(req, res) {
    try {
      const receivings = await Receiving.getAll();
      res.json({ receivings });
    } catch (error) {
      console.error('Get receivings error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get receiving by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const receiving = await Receiving.findById(id);
      
      if (!receiving) {
        return res.status(404).json({ message: 'Receiving not found' });
      }

      res.json({ receiving });
    } catch (error) {
      console.error('Get receiving error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Create new receiving
  static async create(req, res) {
    try {
      const { item_id, supplier, qty, tanggal_terima } = req.body;

      // Validate input
      if (!item_id || !supplier || !qty || !tanggal_terima) {
        return res.status(400).json({ 
          message: 'Item ID, supplier, quantity, and tanggal terima are required' 
        });
      }

      // Check if item exists
      const item = await Item.findById(item_id);
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      // Create receiving (pending approval)
      const receivingId = await Receiving.create({
        item_id,
        supplier,
        qty: parseInt(qty),
        tanggal_terima,
        created_by: req.user.id
      });

      const newReceiving = await Receiving.findById(receivingId);
      
      res.status(201).json({
        message: 'Receiving created successfully, pending approval',
        receiving: newReceiving
      });
    } catch (error) {
      console.error('Create receiving error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Approve or reject receiving (Super Admin only)
  static async updateApproval(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ 
          message: 'Status must be either approved or rejected' 
        });
      }

      // Check if receiving exists and is pending
      const receiving = await Receiving.findById(id);
      if (!receiving) {
        return res.status(404).json({ message: 'Receiving not found' });
      }

      if (receiving.status_approval !== 'pending') {
        return res.status(400).json({ 
          message: `Receiving already ${receiving.status_approval}` 
        });
      }

      // Update approval status
      await Receiving.updateApproval(id, status, req.user.id);

      // If approved, update item stock
      if (status === 'approved') {
        await Item.updateStock(receiving.item_id, receiving.qty, 'add');
      }

      const updatedReceiving = await Receiving.findById(id);
      
      res.json({
        message: `Receiving ${status} successfully`,
        receiving: updatedReceiving
      });
    } catch (error) {
      console.error('Update approval error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get pending receivings
  static async getPending(req, res) {
    try {
      const receivings = await Receiving.getPending();
      res.json({ receivings });
    } catch (error) {
      console.error('Get pending receivings error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get receivings by date range
  static async getByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ 
          message: 'Start date and end date are required' 
        });
      }

      const receivings = await Receiving.getByDateRange(startDate, endDate);
      res.json({ receivings });
    } catch (error) {
      console.error('Get receivings by date range error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = ReceivingController;