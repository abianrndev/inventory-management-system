import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft, Search, Filter, Download } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { formatDate, formatDateForInput, getTodayDate, getStatusClass, getStatusText } from '../utils/helpers';
import { exportBorrowingsToPDF } from '../utils/pdfExport';

const Borrowings = () => {
  const { hasAnyRole } = useAuth();
  const [borrowings, setBorrowings] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    item_id: '',
    nama_proyek: '',
    peminjam: '',
    qty: '',
    tanggal_pinjam: getTodayDate(),
    keterangan: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const canCreateBorrowing = hasAnyRole(['super_admin', 'admin']);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [borrowingsRes, itemsRes] = await Promise.all([
        api.get('/borrowings'),
        api.get('/items')
      ]);
      setBorrowings(borrowingsRes.data.borrowings);
      setItems(itemsRes.data.items);
    } catch (err) {
      setError('Failed to fetch data');
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
      const response = await api.post('/borrowings', formData);
      setSuccess('Peminjaman berhasil dibuat');
      setBorrowings([response.data.borrowing, ...borrowings]);
      setFormData({
        item_id: '',
        nama_proyek: '',
        peminjam: '',
        qty: '',
        tanggal_pinjam: getTodayDate(),
        keterangan: ''
      });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create borrowing');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async (borrowingId) => {
    if (!window.confirm('Apakah Anda yakin ingin mengembalikan barang ini?')) {
      return;
    }

    try {
      const response = await api.put(`/borrowings/${borrowingId}/return`, {
        tanggal_kembali: getTodayDate()
      });
      setSuccess('Barang berhasil dikembalikan');
      setBorrowings(borrowings.map(b => 
        b.id === borrowingId ? response.data.borrowing : b
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to return item');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter borrowings based on search and status
  const filteredBorrowings = borrowings.filter(borrowing => {
    const matchesSearch = borrowing.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         borrowing.peminjam.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         borrowing.nama_proyek.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || borrowing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading borrowings..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Peminjaman Barang</h1>
          <p className="mt-2 text-gray-600">
            Kelola peminjaman dan pengembalian barang
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => exportBorrowingsToPDF(filteredBorrowings)}
            className="btn btn-secondary flex items-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Export PDF
          </button>
          {canCreateBorrowing && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Tambah Peminjaman
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Form */}
      {showForm && canCreateBorrowing && (
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <button
              onClick={() => setShowForm(false)}
              className="btn btn-secondary mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold">Tambah Peminjaman Baru</h2>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Barang</label>
              <select
                name="item_id"
                value={formData.item_id}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="">Pilih barang</option>
                {items.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.nama_barang} (Stok: {item.stok_current} {item.satuan})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Nama Proyek</label>
              <input
                type="text"
                name="nama_proyek"
                value={formData.nama_proyek}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Masukkan nama proyek"
                required
              />
            </div>

            <div>
              <label className="form-label">Peminjam</label>
              <input
                type="text"
                name="peminjam"
                value={formData.peminjam}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Nama peminjam"
                required
              />
            </div>

            <div>
              <label className="form-label">Jumlah</label>
              <input
                type="number"
                name="qty"
                value={formData.qty}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Jumlah barang"
                min="1"
                required
              />
            </div>

            <div>
              <label className="form-label">Tanggal Pinjam</label>
              <input
                type="date"
                name="tanggal_pinjam"
                value={formData.tanggal_pinjam}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="form-label">Keterangan</label>
              <textarea
                name="keterangan"
                value={formData.keterangan}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Keterangan tambahan (opsional)"
                rows="3"
              />
            </div>

            <div className="md:col-span-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
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
                {submitting ? 'Menyimpan...' : 'Simpan'}
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
                placeholder="Cari berdasarkan nama barang, peminjam, atau proyek..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input w-auto"
            >
              <option value="all">Semua Status</option>
              <option value="dipinjam">Dipinjam</option>
              <option value="dikembalikan">Dikembalikan</option>
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
                <th>Barang</th>
                <th>Proyek</th>
                <th>Peminjam</th>
                <th>Jumlah</th>
                <th>Tgl Pinjam</th>
                <th>Tgl Kembali</th>
                <th>Status</th>
                <th>Keterangan</th>
                {canCreateBorrowing && <th>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {filteredBorrowings.map((borrowing) => (
                <tr key={borrowing.id}>
                  <td className="font-mono text-sm">#{borrowing.id}</td>
                  <td>
                    <div>
                      <div className="font-medium">{borrowing.nama_barang}</div>
                      <div className="text-sm text-gray-500">{borrowing.kategori}</div>
                    </div>
                  </td>
                  <td>{borrowing.nama_proyek}</td>
                  <td>{borrowing.peminjam}</td>
                  <td>{borrowing.qty} {borrowing.satuan}</td>
                  <td>{formatDate(borrowing.tanggal_pinjam)}</td>
                  <td>{borrowing.tanggal_kembali ? formatDate(borrowing.tanggal_kembali) : '-'}</td>
                  <td>
                    <span className={getStatusClass(borrowing.status)}>
                      {getStatusText(borrowing.status)}
                    </span>
                  </td>
                  <td className="max-w-xs truncate">{borrowing.keterangan || '-'}</td>
                  {canCreateBorrowing && (
                    <td>
                      {borrowing.status === 'dipinjam' && (
                        <button
                          onClick={() => handleReturn(borrowing.id)}
                          className="btn btn-success btn-sm"
                        >
                          Kembalikan
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBorrowings.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {borrowings.length === 0 ? 'Belum ada data peminjaman' : 'Tidak ada data yang sesuai dengan filter'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Borrowings;