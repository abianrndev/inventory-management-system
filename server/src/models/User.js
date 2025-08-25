const { pool } = require('../utils/database');

class User {
  // Get user by username
  static async findByUsername(username) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Get user by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, username, role, created_at FROM users WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Get all users
  static async getAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT id, username, role, created_at FROM users ORDER BY created_at DESC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Create new user
  static async create(userData) {
    try {
      const { username, password, role } = userData;
      const [result] = await pool.execute(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, password, role]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Update user
  static async update(id, userData) {
    try {
      const { username, role } = userData;
      await pool.execute(
        'UPDATE users SET username = ?, role = ? WHERE id = ?',
        [username, role, id]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Delete user
  static async delete(id) {
    try {
      await pool.execute('DELETE FROM users WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;