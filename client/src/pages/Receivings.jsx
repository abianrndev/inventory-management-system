import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft, Search, Filter, CheckCircle, XCircle, Download } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { formatDate, formatDateForInput, getTodayDate, getStatusClass, getStatusText } from '../utils/helpers';
import { exportReceivingsToPDF } from '../utils/pdfExport';

const Receivings = () => {
  const { hasAnyRole, hasRole } = useAuth();
  const [receivings, setReceivings] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    item_id: '',
    supplier: '',
    qty: '',
    tanggal_terima: getTodayDate()
  });
  const [submitting, setSubmitting] = useState(false);

  const canCreateReceiving = hasAnyRole(['super_admin', 'admin']);
  const canApprove = hasRole('super_admin');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [receivingsRes, itemsRes] = await Promise.all([
        api.get('/receivings'),
        api.get('/items')
      ]);
      setReceivings(receivingsRes.data.receivings);
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
      const response = await api.post('/receivings', formData);
      setSuccess('Penerimaan berhasil dibuat dan menunggu approval');
      setReceivings([response.data.receiving, ...receivings]);
      setFormData({
        item_id: '',
        supplier: '',
        qty: '',
        tanggal_terima: getTodayDate()
      });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create receiving');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproval = async (receivingId, status) => {
    const action = status === 'approved' ? 'menyetujui' : 'menolak';
    if (!window.confirm(`Apakah Anda yakin ingin ${action} penerimaan ini?`)) {
      return;
    }

    try {
      const response = await api.put(`/receivings/${receivingId}/approve`, { status });
      setSuccess(`Penerimaan berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`);
      setReceivings(receivings.map(r => 
        r.id === receivingId ? response.data.receiving : r
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update approval');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter receivings based on search and status
  const filteredReceivings = receivings.filter(receiving => {
    const matchesSearch = receiving.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receiving.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || receiving.status_approval === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading receivings..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Penerimaan Barang</h1>
          <p className="mt-2 text-gray-600">
            Kelola penerimaan barang dari supplier dengan approval workflow
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => exportReceivingsToPDF(filteredReceivings)}
            className="btn btn-secondary flex items-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Export PDF
          </button>
          {canCreateReceiving && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Tambah Penerimaan
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Form */}
      {showForm && canCreateReceiving && (
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <button
              onClick={() => setShowForm(false)}
              className="btn btn-secondary mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold">Tambah Penerimaan Baru</h2>
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
              <label className="form-label">Supplier</label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Nama supplier"
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
              <label className="form-label">Tanggal Terima</label>
              <input
                type="date"
                name="tanggal_terima"
                value={formData.tanggal_terima}
                onChange={handleInputChange}
                className="form-input"
                required
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

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Info:</strong> Penerimaan yang dibuat akan menunggu approval dari Super Admin 
              sebelum stok barang bertambah.
            </p>
          </div>
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
                placeholder="Cari berdasarkan nama barang atau supplier..."
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
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
                <th>Supplier</th>
                <th>Jumlah</th>
                <th>Tgl Terima</th>
                <th>Status</th>
                <th>Dibuat Oleh</th>
                <th>Disetujui Oleh</th>
                <th>Tgl Approval</th>
                {canApprove && <th>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {filteredReceivings.map((receiving) => (
                <tr key={receiving.id}>
                  <td className="font-mono text-sm">#{receiving.id}</td>
                  <td>
                    <div>
                      <div className="font-medium">{receiving.nama_barang}</div>
                      <div className="text-sm text-gray-500">{receiving.kategori}</div>
                    </div>
                  </td>
                  <td>{receiving.supplier}</td>
                  <td>{receiving.qty} {receiving.satuan}</td>
                  <td>{formatDate(receiving.tanggal_terima)}</td>
                  <td>
                    <span className={getStatusClass(receiving.status_approval)}>
                      {getStatusText(receiving.status_approval)}
                    </span>
                  </td>
                  <td>{receiving.created_by_username}</td>
                  <td>{receiving.approved_by_username || '-'}</td>
                  <td>{receiving.approved_at ? formatDate(receiving.approved_at) : '-'}</td>
                  {canApprove && (
                    <td>
                      {receiving.status_approval === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproval(receiving.id, 'approved')}
                            className="btn btn-success btn-sm flex items-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproval(receiving.id, 'rejected')}
                            className="btn btn-danger btn-sm flex items-center"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReceivings.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {receivings.length === 0 ? 'Belum ada data penerimaan' : 'Tidak ada data yang sesuai dengan filter'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Receivings;