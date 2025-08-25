const { pool } = require('../utils/database');

class Receiving {
  // Get all receivings with item and user details
  static async getAll() {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          r.*,
          i.nama_barang,
          i.kategori,
          i.satuan,
          u1.username as created_by_username,
          u2.username as approved_by_username
        FROM receivings r
        JOIN items i ON r.item_id = i.id
        JOIN users u1 ON r.created_by = u1.id
        LEFT JOIN users u2 ON r.approved_by = u2.id
        ORDER BY r.created_at DESC
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get receiving by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          r.*,
          i.nama_barang,
          i.kategori,
          i.satuan,
          u1.username as created_by_username,
          u2.username as approved_by_username
        FROM receivings r
        JOIN items i ON r.item_id = i.id
        JOIN users u1 ON r.created_by = u1.id
        LEFT JOIN users u2 ON r.approved_by = u2.id
        WHERE r.id = ?
      `, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Create new receiving
  static async create(receivingData) {
    try {
      const { item_id, supplier, qty, tanggal_terima, created_by } = receivingData;
      const [result] = await pool.execute(
        'INSERT INTO receivings (item_id, supplier, qty, tanggal_terima, created_by) VALUES (?, ?, ?, ?, ?)',
        [item_id, supplier, qty, tanggal_terima, created_by]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Approve/Reject receiving
  static async updateApproval(id, status, approved_by) {
    try {
      const approved_at = status === 'approved' ? new Date() : null;
      await pool.execute(
        'UPDATE receivings SET status_approval = ?, approved_by = ?, approved_at = ? WHERE id = ?',
        [status, approved_by, approved_at, id]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get pending receivings
  static async getPending() {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          r.*,
          i.nama_barang,
          i.kategori,
          i.satuan,
          u.username as created_by_username
        FROM receivings r
        JOIN items i ON r.item_id = i.id
        JOIN users u ON r.created_by = u.id
        WHERE r.status_approval = 'pending'
        ORDER BY r.created_at ASC
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get receivings by date range
  static async getByDateRange(startDate, endDate) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          r.*,
          i.nama_barang,
          i.kategori,
          i.satuan,
          u1.username as created_by_username,
          u2.username as approved_by_username
        FROM receivings r
        JOIN items i ON r.item_id = i.id
        JOIN users u1 ON r.created_by = u1.id
        LEFT JOIN users u2 ON r.approved_by = u2.id
        WHERE r.tanggal_terima BETWEEN ? AND ?
        ORDER BY r.tanggal_terima DESC
      `, [startDate, endDate]);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Receiving;