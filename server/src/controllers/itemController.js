const Item = require('../models/Item');

class ItemController {
  // Get all items
  static async getAll(req, res) {
    try {
      const items = await Item.getAll();
      res.json({ items });
    } catch (error) {
      console.error('Get items error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get item by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const item = await Item.findById(id);
      
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      res.json({ item });
    } catch (error) {
      console.error('Get item error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Create new item
  static async create(req, res) {
    try {
      const { nama_barang, kategori, satuan, stok_current, stok_minimal } = req.body;

      // Validate input
      if (!nama_barang || !kategori || !satuan) {
        return res.status(400).json({ 
          message: 'Nama barang, kategori, and satuan are required' 
        });
      }

      const itemId = await Item.create({
        nama_barang,
        kategori,
        satuan,
        stok_current: parseInt(stok_current) || 0,
        stok_minimal: parseInt(stok_minimal) || 0
      });

      const newItem = await Item.findById(itemId);
      
      res.status(201).json({
        message: 'Item created successfully',
        item: newItem
      });
    } catch (error) {
      console.error('Create item error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Update item
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nama_barang, kategori, satuan, stok_current, stok_minimal } = req.body;

      // Check if item exists
      const existingItem = await Item.findById(id);
      if (!existingItem) {
        return res.status(404).json({ message: 'Item not found' });
      }

      // Validate input
      if (!nama_barang || !kategori || !satuan) {
        return res.status(400).json({ 
          message: 'Nama barang, kategori, and satuan are required' 
        });
      }

      await Item.update(id, {
        nama_barang,
        kategori,
        satuan,
        stok_current: parseInt(stok_current) || 0,
        stok_minimal: parseInt(stok_minimal) || 0
      });

      const updatedItem = await Item.findById(id);
      
      res.json({
        message: 'Item updated successfully',
        item: updatedItem
      });
    } catch (error) {
      console.error('Update item error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Delete item
  static async delete(req, res) {
    try {
      const { id } = req.params;

      // Check if item exists
      const existingItem = await Item.findById(id);
      if (!existingItem) {
        return res.status(404).json({ message: 'Item not found' });
      }

      await Item.delete(id);
      
      res.json({ message: 'Item deleted successfully' });
    } catch (error) {
      console.error('Delete item error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get low stock items
  static async getLowStock(req, res) {
    try {
      const items = await Item.getLowStock();
      res.json({ items });
    } catch (error) {
      console.error('Get low stock items error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Update stock (for internal use)
  static async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { quantity, operation } = req.body;

      // Check if item exists
      const existingItem = await Item.findById(id);
      if (!existingItem) {
        return res.status(404).json({ message: 'Item not found' });
      }

      // Validate input
      if (!quantity || !['add', 'subtract'].includes(operation)) {
        return res.status(400).json({ 
          message: 'Quantity and valid operation (add/subtract) are required' 
        });
      }

      await Item.updateStock(id, quantity, operation);
      const updatedItem = await Item.findById(id);
      
      res.json({
        message: 'Stock updated successfully',
        item: updatedItem
      });
    } catch (error) {
      console.error('Update stock error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = ItemController;