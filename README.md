# Inventory Management System

Sistem manajemen inventory lengkap untuk perusahaan logistik dengan tech stack React, Express.js, MySQL, dan Tailwind CSS.

## Features

### User Roles & Permissions
- **Super Admin**: Input, delete, approve barang + manage users
- **Admin**: Input barang saja  
- **Client**: View/monitoring only

### Core Functionality
- **Authentication System** dengan JWT dan role-based access
- **Dashboard** dengan summary cards dan charts
- **Peminjaman Barang** dengan tracking status
- **Penerimaan Barang** dengan approval workflow
- **Master Data Management** untuk super admin
- **Export PDF** untuk laporan

## Tech Stack

### Backend
- **Express.js** - REST API server
- **MySQL** - Database dengan foreign key constraints
- **JWT** - Authentication & authorization
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security headers
- **Rate limiting** - API protection

### Frontend
- **React 18** dengan hooks
- **Vite** - Build tool dan dev server
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Data visualization
- **Axios** - HTTP client dengan interceptors
- **Lucide React** - Modern icon library

## Prerequisites

- Node.js 18+ dan npm
- MySQL 8.0+
- Git

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/abianrndev/inventory-management-system.git
cd inventory-management-system
```

### 2. Setup Database
```bash
# Login ke MySQL sebagai root
mysql -u root -p

# Buat database dan user (opsional)
CREATE DATABASE inventory_management;
CREATE USER 'inventory_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON inventory_management.* TO 'inventory_user'@'localhost';
FLUSH PRIVILEGES;

# Import schema dan sample data
mysql -u root -p inventory_management < server/database/init.sql
```

### 3. Setup Backend
```bash
cd server

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Edit .env file dengan konfigurasi database Anda
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=inventory_management
JWT_SECRET=your_super_secret_jwt_key_here
```

### 4. Setup Frontend
```bash
cd ../client

# Install dependencies
npm install
```

### 5. Run Application
```bash
# Dari root directory, jalankan kedua server sekaligus
npm run dev

# Atau jalankan terpisah:
# Terminal 1 - Backend (port 5000)
cd server && npm run dev

# Terminal 2 - Frontend (port 3000)  
cd client && npm run dev
```

### 6. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## Default Users

| Role | Username | Password |
|------|----------|----------|
| Super Admin | superadmin | admin123 |
| Admin | admin | admin123 |
| Client | client | client123 |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/register` - Register new user (super admin only)

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/trends` - Monthly trends data

### Items (Master Data)
- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get item by ID
- `POST /api/items` - Create new item (admin+)
- `PUT /api/items/:id` - Update item (admin+)
- `DELETE /api/items/:id` - Delete item (super admin only)

### Borrowings
- `GET /api/borrowings` - Get all borrowings
- `GET /api/borrowings/:id` - Get borrowing by ID
- `POST /api/borrowings` - Create new borrowing
- `PUT /api/borrowings/:id/return` - Return borrowed item

### Receivings
- `GET /api/receivings` - Get all receivings
- `GET /api/receivings/:id` - Get receiving by ID
- `POST /api/receivings` - Create new receiving
- `PUT /api/receivings/:id/approve` - Approve/reject receiving (super admin only)

## Database Schema

### Users Table
```sql
users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE,
  password VARCHAR(255),
  role ENUM('super_admin', 'admin', 'client'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Items Table
```sql
items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama_barang VARCHAR(100),
  kategori VARCHAR(50),
  satuan VARCHAR(20),
  stok_current INT DEFAULT 0,
  stok_minimal INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Borrowings Table
```sql
borrowings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_id INT,
  nama_proyek VARCHAR(100),
  peminjam VARCHAR(100),
  qty INT,
  tanggal_pinjam DATE,
  tanggal_kembali DATE NULL,
  status ENUM('dipinjam', 'dikembalikan') DEFAULT 'dipinjam',
  keterangan TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
)
```

### Receivings Table
```sql
receivings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_id INT,
  supplier VARCHAR(100),
  qty INT,
  tanggal_terima DATE,
  status_approval ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approved_by INT NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL,
  FOREIGN KEY (item_id) REFERENCES items(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
)
```

## Development

### Backend Development
```bash
cd server
npm run dev  # Menggunakan nodemon untuk auto-reload
```

### Frontend Development
```bash
cd client
npm run dev  # Menggunakan Vite dengan HMR
```

### Build for Production
```bash
# Build frontend
cd client
npm run build

# Start production server
cd ../server
npm start
```

## Project Structure
```
inventory-management-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── public/             # Static assets
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── app.js          # Express app
│   ├── database/
│   │   └── init.sql        # Database schema & sample data
│   ├── .env.example        # Environment variables template
│   └── package.json
├── package.json            # Root package.json dengan scripts
└── README.md
```

## Security Features

- **JWT Authentication** dengan expiration
- **Password hashing** menggunakan bcryptjs
- **Role-based authorization** middleware
- **SQL injection protection** dengan parameterized queries
- **CORS configuration** untuk frontend access
- **Rate limiting** untuk API protection
- **Security headers** dengan Helmet
- **Input validation** di frontend dan backend

## Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - lihat file [LICENSE](LICENSE) untuk detail.

## Support

Jika ada pertanyaan atau masalah:
1. Buka issue di GitHub repository
2. Periksa dokumentasi API di `/api` endpoints
3. Review database schema di `server/database/init.sql`