const { pool } = require('../utils/database');

class Item {
  // Get all items
  static async getAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM items ORDER BY nama_barang ASC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get item by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM items WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Create new item
  static async create(itemData) {
    try {
      const { nama_barang, kategori, satuan, stok_current, stok_minimal } = itemData;
      const [result] = await pool.execute(
        'INSERT INTO items (nama_barang, kategori, satuan, stok_current, stok_minimal) VALUES (?, ?, ?, ?, ?)',
        [nama_barang, kategori, satuan, stok_current || 0, stok_minimal || 0]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Update item
  static async update(id, itemData) {
    try {
      const { nama_barang, kategori, satuan, stok_current, stok_minimal } = itemData;
      await pool.execute(
        'UPDATE items SET nama_barang = ?, kategori = ?, satuan = ?, stok_current = ?, stok_minimal = ? WHERE id = ?',
        [nama_barang, kategori, satuan, stok_current, stok_minimal, id]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Delete item
  static async delete(id) {
    try {
      await pool.execute('DELETE FROM items WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Update stock
  static async updateStock(id, quantity, operation = 'add') {
    try {
      const operator = operation === 'add' ? '+' : '-';
      await pool.execute(
        `UPDATE items SET stok_current = stok_current ${operator} ? WHERE id = ?`,
        [Math.abs(quantity), id]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get low stock items
  static async getLowStock() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM items WHERE stok_current <= stok_minimal ORDER BY nama_barang ASC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Item;