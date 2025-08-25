-- Inventory Management System Database Schema
-- Create database if not exists
CREATE DATABASE IF NOT EXISTS inventory_management;
USE inventory_management;

-- Users & Authentication table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'client') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Master Items table
CREATE TABLE IF NOT EXISTS items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama_barang VARCHAR(100) NOT NULL,
    kategori VARCHAR(50) NOT NULL,
    satuan VARCHAR(20) NOT NULL,
    stok_current INT DEFAULT 0,
    stok_minimal INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Borrowings table with tracking
CREATE TABLE IF NOT EXISTS borrowings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    nama_proyek VARCHAR(100) NOT NULL,
    peminjam VARCHAR(100) NOT NULL,
    qty INT NOT NULL,
    tanggal_pinjam DATE NOT NULL,
    tanggal_kembali DATE NULL,
    status ENUM('dipinjam', 'dikembalikan') DEFAULT 'dipinjam',
    keterangan TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Receivings table with approval workflow
CREATE TABLE IF NOT EXISTS receivings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    supplier VARCHAR(100) NOT NULL,
    qty INT NOT NULL,
    tanggal_terima DATE NOT NULL,
    status_approval ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by INT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default users (passwords are hashed version of "admin123")
-- All users have password: admin123
INSERT IGNORE INTO users (username, password, role) VALUES
('superadmin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin'),
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('client', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client');

-- Insert sample items
INSERT IGNORE INTO items (nama_barang, kategori, satuan, stok_current, stok_minimal) VALUES
('Laptop Dell XPS', 'Electronics', 'Unit', 50, 10),
('Mouse Wireless', 'Electronics', 'Unit', 100, 20),
('Keyboard Mechanical', 'Electronics', 'Unit', 30, 5),
('Monitor 24 inch', 'Electronics', 'Unit', 25, 5),
('Printer Canon', 'Electronics', 'Unit', 15, 3),
('Cable HDMI', 'Electronics', 'Meter', 200, 50),
('Hard Drive 1TB', 'Storage', 'Unit', 40, 8),
('RAM 8GB DDR4', 'Electronics', 'Unit', 60, 15),
('Router Wifi', 'Network', 'Unit', 20, 5),
('Switch 24 Port', 'Network', 'Unit', 10, 2);

-- Insert sample borrowings
INSERT IGNORE INTO borrowings (item_id, nama_proyek, peminjam, qty, tanggal_pinjam, status, keterangan, created_by) VALUES
(1, 'Project Alpha', 'John Doe', 2, '2024-01-15', 'dipinjam', 'For development team', 2),
(2, 'Project Beta', 'Jane Smith', 5, '2024-01-10', 'dikembalikan', 'Marketing presentation', 2),
(3, 'Project Gamma', 'Bob Wilson', 1, '2024-01-20', 'dipinjam', 'System admin work', 2);

-- Insert sample receivings
INSERT IGNORE INTO receivings (item_id, supplier, qty, tanggal_terima, status_approval, created_by) VALUES
(1, 'PT Tech Supplier', 10, '2024-01-05', 'approved', 2),
(2, 'CV Electronic Store', 20, '2024-01-08', 'pending', 2),
(4, 'PT Monitor Indonesia', 5, '2024-01-12', 'approved', 2);