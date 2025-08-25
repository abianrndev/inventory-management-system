const Borrowing = require('../models/Borrowing');
const Item = require('../models/Item');

class BorrowingController {
  // Get all borrowings
  static async getAll(req, res) {
    try {
      const borrowings = await Borrowing.getAll();
      res.json({ borrowings });
    } catch (error) {
      console.error('Get borrowings error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get borrowing by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const borrowing = await Borrowing.findById(id);
      
      if (!borrowing) {
        return res.status(404).json({ message: 'Borrowing not found' });
      }

      res.json({ borrowing });
    } catch (error) {
      console.error('Get borrowing error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Create new borrowing
  static async create(req, res) {
    try {
      const { item_id, nama_proyek, peminjam, qty, tanggal_pinjam, keterangan } = req.body;

      // Validate input
      if (!item_id || !nama_proyek || !peminjam || !qty || !tanggal_pinjam) {
        return res.status(400).json({ 
          message: 'Item ID, nama proyek, peminjam, quantity, and tanggal pinjam are required' 
        });
      }

      // Check if item exists and has sufficient stock
      const item = await Item.findById(item_id);
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      if (item.stok_current < qty) {
        return res.status(400).json({ 
          message: `Insufficient stock. Available: ${item.stok_current} ${item.satuan}` 
        });
      }

      // Create borrowing
      const borrowingId = await Borrowing.create({
        item_id,
        nama_proyek,
        peminjam,
        qty: parseInt(qty),
        tanggal_pinjam,
        keterangan,
        created_by: req.user.id
      });

      // Update item stock (subtract borrowed quantity)
      await Item.updateStock(item_id, qty, 'subtract');

      const newBorrowing = await Borrowing.findById(borrowingId);
      
      res.status(201).json({
        message: 'Borrowing created successfully',
        borrowing: newBorrowing
      });
    } catch (error) {
      console.error('Create borrowing error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Return borrowed item
  static async returnItem(req, res) {
    try {
      const { id } = req.params;
      const { tanggal_kembali } = req.body;

      // Check if borrowing exists and is still active
      const borrowing = await Borrowing.findById(id);
      if (!borrowing) {
        return res.status(404).json({ message: 'Borrowing not found' });
      }

      if (borrowing.status === 'dikembalikan') {
        return res.status(400).json({ message: 'Item already returned' });
      }

      // Validate return date
      if (!tanggal_kembali) {
        return res.status(400).json({ message: 'Return date is required' });
      }

      // Update borrowing status
      await Borrowing.returnItem(id, tanggal_kembali);

      // Update item stock (add returned quantity back)
      await Item.updateStock(borrowing.item_id, borrowing.qty, 'add');

      const updatedBorrowing = await Borrowing.findById(id);
      
      res.json({
        message: 'Item returned successfully',
        borrowing: updatedBorrowing
      });
    } catch (error) {
      console.error('Return item error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get active borrowings
  static async getActive(req, res) {
    try {
      const borrowings = await Borrowing.getActive();
      res.json({ borrowings });
    } catch (error) {
      console.error('Get active borrowings error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get borrowings by date range
  static async getByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ 
          message: 'Start date and end date are required' 
        });
      }

      const borrowings = await Borrowing.getByDateRange(startDate, endDate);
      res.json({ borrowings });
    } catch (error) {
      console.error('Get borrowings by date range error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = BorrowingController;