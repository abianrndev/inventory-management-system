const { pool } = require('../utils/database');

class Borrowing {
  // Get all borrowings with item and user details
  static async getAll() {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          b.*,
          i.nama_barang,
          i.kategori,
          i.satuan,
          u.username as created_by_username
        FROM borrowings b
        JOIN items i ON b.item_id = i.id
        JOIN users u ON b.created_by = u.id
        ORDER BY b.created_at DESC
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get borrowing by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          b.*,
          i.nama_barang,
          i.kategori,
          i.satuan,
          u.username as created_by_username
        FROM borrowings b
        JOIN items i ON b.item_id = i.id
        JOIN users u ON b.created_by = u.id
        WHERE b.id = ?
      `, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Create new borrowing
  static async create(borrowingData) {
    try {
      const { item_id, nama_proyek, peminjam, qty, tanggal_pinjam, keterangan, created_by } = borrowingData;
      const [result] = await pool.execute(
        'INSERT INTO borrowings (item_id, nama_proyek, peminjam, qty, tanggal_pinjam, keterangan, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [item_id, nama_proyek, peminjam, qty, tanggal_pinjam, keterangan, created_by]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Return borrowed item
  static async returnItem(id, tanggal_kembali) {
    try {
      await pool.execute(
        'UPDATE borrowings SET status = ?, tanggal_kembali = ? WHERE id = ?',
        ['dikembalikan', tanggal_kembali, id]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get active borrowings
  static async getActive() {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          b.*,
          i.nama_barang,
          i.kategori,
          i.satuan,
          u.username as created_by_username
        FROM borrowings b
        JOIN items i ON b.item_id = i.id
        JOIN users u ON b.created_by = u.id
        WHERE b.status = 'dipinjam'
        ORDER BY b.tanggal_pinjam ASC
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get borrowings by date range
  static async getByDateRange(startDate, endDate) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          b.*,
          i.nama_barang,
          i.kategori,
          i.satuan,
          u.username as created_by_username
        FROM borrowings b
        JOIN items i ON b.item_id = i.id
        JOIN users u ON b.created_by = u.id
        WHERE b.tanggal_pinjam BETWEEN ? AND ?
        ORDER BY b.tanggal_pinjam DESC
      `, [startDate, endDate]);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Borrowing;