import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft, Search, Edit, Trash2, Shield, User, Eye } from 'lucide-react';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { formatDate } from '../utils/helpers';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'client'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // For now, we'll use the auth/me endpoint since we don't have a users endpoint
      // In a real application, you would create a GET /api/users endpoint
      const response = await api.get('/auth/me');
      // This is a placeholder - in real app you'd fetch all users
      setUsers([response.data.user]);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await api.post('/auth/register', formData);
      setSuccess('User berhasil ditambahkan');
      // In a real app, you'd refresh the users list
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      role: 'client'
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super_admin':
        return <Shield className="h-4 w-4 text-red-600" />;
      case 'admin':
        return <User className="h-4 w-4 text-blue-600" />;
      default:
        return <Eye className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      super_admin: { class: 'bg-red-100 text-red-800', text: 'Super Admin' },
      admin: { class: 'bg-blue-100 text-blue-800', text: 'Admin' },
      client: { class: 'bg-gray-100 text-gray-800', text: 'Client' }
    };

    const config = roleConfig[role] || roleConfig.client;
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${config.class}`}>
        {getRoleIcon(role)}
        <span className="ml-1">{config.text}</span>
      </span>
    );
  };

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading users..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen User</h1>
          <p className="mt-2 text-gray-600">
            Kelola user dan permission dalam sistem
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Tambah User
          </button>
        )}
      </div>

      {/* Alerts */}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Form */}
      {showForm && (
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <button
              onClick={resetForm}
              className="btn btn-secondary mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold">
              {editingUser ? 'Edit User' : 'Tambah User Baru'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Masukkan username"
                required
              />
            </div>

            <div>
              <label className="form-label">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="client">Client (View Only)</option>
                <option value="admin">Admin (Input Data)</option>
                <option value="super_admin">Super Admin (Full Access)</option>
              </select>
            </div>

            {!editingUser && (
              <div className="md:col-span-2">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Masukkan password"
                  required
                />
              </div>
            )}

            <div className="md:col-span-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Menyimpan...' : (editingUser ? 'Update' : 'Simpan')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="form-input w-auto"
            >
              <option value="all">Semua Role</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="client">Client</option>
            </select>
          </div>
        </div>
      </div>

      {/* Role Permissions Info */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Permission Roles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-red-200 bg-red-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Shield className="h-5 w-5 text-red-600 mr-2" />
              <h4 className="font-semibold text-red-800">Super Admin</h4>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Semua permission Admin</li>
              <li>• Approve/reject penerimaan</li>
              <li>• Hapus master barang</li>
              <li>• Kelola user & role</li>
            </ul>
          </div>

          <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <User className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-semibold text-blue-800">Admin</h4>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Semua permission Client</li>
              <li>• Input peminjaman barang</li>
              <li>• Input penerimaan barang</li>
              <li>• CRUD master barang</li>
            </ul>
          </div>

          <div className="border border-gray-200 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Eye className="h-5 w-5 text-gray-600 mr-2" />
              <h4 className="font-semibold text-gray-800">Client</h4>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Lihat dashboard</li>
              <li>• Lihat data peminjaman</li>
              <li>• Lihat data penerimaan</li>
              <li>• Export laporan PDF</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-auto">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>Dibuat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="font-mono text-sm">#{user.id}</td>
                  <td className="font-medium">{user.username}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {/* TODO: Implement edit */}}
                        className="btn btn-secondary btn-sm flex items-center"
                        disabled
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => {/* TODO: Implement delete */}}
                        className="btn btn-danger btn-sm flex items-center"
                        disabled
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {users.length === 0 ? 'Belum ada data user' : 'Tidak ada data yang sesuai dengan filter'}
            </p>
          </div>
        )}
      </div>

      {/* Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Catatan:</strong> Fitur edit dan hapus user sedang dalam pengembangan. 
          Saat ini hanya bisa menambah user baru melalui form registrasi.
        </p>
      </div>
    </div>
  );
};

export default Users;