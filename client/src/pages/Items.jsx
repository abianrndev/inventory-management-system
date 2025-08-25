import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft, Search, Edit, Trash2, AlertTriangle, Download } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { formatDate, formatNumber } from '../utils/helpers';
import { exportItemsToPDF } from '../utils/pdfExport';

const Items = () => {
  const { hasRole } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formData, setFormData] = useState({
    nama_barang: '',
    kategori: '',
    satuan: '',
    stok_current: '',
    stok_minimal: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const canDelete = hasRole('super_admin');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get('/items');
      setItems(response.data.items);
    } catch (err) {
      setError('Failed to fetch items');
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
      if (editingItem) {
        const response = await api.put(`/items/${editingItem.id}`, formData);
        setSuccess('Barang berhasil diperbarui');
        setItems(items.map(item => 
          item.id === editingItem.id ? response.data.item : item
        ));
      } else {
        const response = await api.post('/items', formData);
        setSuccess('Barang berhasil ditambahkan');
        setItems([response.data.item, ...items]);
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      nama_barang: item.nama_barang,
      kategori: item.kategori,
      satuan: item.satuan,
      stok_current: item.stok_current.toString(),
      stok_minimal: item.stok_minimal.toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus barang ini? Data peminjaman dan penerimaan terkait akan ikut terhapus.')) {
      return;
    }

    try {
      await api.delete(`/items/${itemId}`);
      setSuccess('Barang berhasil dihapus');
      setItems(items.filter(item => item.id !== itemId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete item');
    }
  };

  const resetForm = () => {
    setFormData({
      nama_barang: '',
      kategori: '',
      satuan: '',
      stok_current: '',
      stok_minimal: ''
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Get unique categories for filter
  const categories = [...new Set(items.map(item => item.kategori))];

  // Filter items based on search and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.kategori.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.kategori === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading items..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Master Barang</h1>
          <p className="mt-2 text-gray-600">
            Kelola data master barang dalam sistem inventory
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => exportItemsToPDF(filteredItems)}
            className="btn btn-secondary flex items-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Export PDF
          </button>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Tambah Barang
            </button>
          )}
        </div>
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
              {editingItem ? 'Edit Barang' : 'Tambah Barang Baru'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Nama Barang</label>
              <input
                type="text"
                name="nama_barang"
                value={formData.nama_barang}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Masukkan nama barang"
                required
              />
            </div>

            <div>
              <label className="form-label">Kategori</label>
              <input
                type="text"
                name="kategori"
                value={formData.kategori}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Masukkan kategori"
                required
                list="categories"
              />
              <datalist id="categories">
                {categories.map(category => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="form-label">Satuan</label>
              <input
                type="text"
                name="satuan"
                value={formData.satuan}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Unit, Pcs, Meter, dll"
                required
                list="units"
              />
              <datalist id="units">
                <option value="Unit" />
                <option value="Pcs" />
                <option value="Meter" />
                <option value="Kg" />
                <option value="Liter" />
                <option value="Set" />
                <option value="Box" />
              </datalist>
            </div>

            <div>
              <label className="form-label">Stok Saat Ini</label>
              <input
                type="number"
                name="stok_current"
                value={formData.stok_current}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Jumlah stok saat ini"
                min="0"
                required
              />
            </div>

            <div>
              <label className="form-label">Stok Minimal</label>
              <input
                type="number"
                name="stok_minimal"
                value={formData.stok_minimal}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Batas minimum stok"
                min="0"
                required
              />
            </div>

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
                {submitting ? 'Menyimpan...' : (editingItem ? 'Update' : 'Simpan')}
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
                placeholder="Cari berdasarkan nama barang atau kategori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-input w-auto"
            >
              <option value="all">Semua Kategori</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
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
                <th>Nama Barang</th>
                <th>Kategori</th>
                <th>Satuan</th>
                <th>Stok Saat Ini</th>
                <th>Stok Minimal</th>
                <th>Status Stok</th>
                <th>Dibuat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const isLowStock = item.stok_current <= item.stok_minimal;
                return (
                  <tr key={item.id}>
                    <td className="font-mono text-sm">#{item.id}</td>
                    <td className="font-medium">{item.nama_barang}</td>
                    <td>{item.kategori}</td>
                    <td>{item.satuan}</td>
                    <td>{formatNumber(item.stok_current)}</td>
                    <td>{formatNumber(item.stok_minimal)}</td>
                    <td>
                      {isLowStock ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Stok Rendah
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Stok Aman
                        </span>
                      )}
                    </td>
                    <td>{formatDate(item.created_at)}</td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="btn btn-secondary btn-sm flex items-center"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="btn btn-danger btn-sm flex items-center"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {items.length === 0 ? 'Belum ada data barang' : 'Tidak ada data yang sesuai dengan filter'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Items;