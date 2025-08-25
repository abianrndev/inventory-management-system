import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ArrowRightLeft, 
  PackageCheck, 
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { formatDate, formatNumber, getStatusClass, getStatusText } from '../utils/helpers';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchTrends();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setData(response.data);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error(err);
    }
  };

  const fetchTrends = async () => {
    try {
      const response = await api.get('/dashboard/trends');
      setTrends(response.data);
    } catch (err) {
      console.error('Failed to fetch trends:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading dashboard..." />;
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  // Summary cards data
  const summaryCards = [
    {
      title: 'Total Barang',
      value: data?.summary.totalItems || 0,
      icon: Package,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Stok',
      value: formatNumber(data?.summary.totalStock || 0),
      icon: Package,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Stok Rendah',
      value: data?.summary.lowStockCount || 0,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Sedang Dipinjam',
      value: data?.summary.activeBorrowingsCount || 0,
      icon: ArrowRightLeft,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Menunggu Approval',
      value: data?.summary.pendingReceivingsCount || 0,
      icon: Clock,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    }
  ];

  // Chart data for trends
  const lineChartData = {
    labels: trends?.monthlyData?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Peminjaman',
        data: trends?.monthlyData?.map(item => item.borrowings) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Penerimaan',
        data: trends?.monthlyData?.map(item => item.receivings) || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Chart data for categories
  const doughnutChartData = {
    labels: data?.categoryData?.map(item => item.name) || [],
    datasets: [
      {
        data: data?.categoryData?.map(item => item.count) || [],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#06B6D4',
          '#84CC16',
          '#F97316',
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview sistem inventory management
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {summaryCards.map((card, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className={`text-2xl font-bold ${card.textColor}`}>
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trends Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tren Bulanan
          </h3>
          <div className="h-64">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        {/* Category Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribusi Kategori
          </h3>
          <div className="h-64">
            <Doughnut data={doughnutChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Activities and Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Aktivitas Terbaru
          </h3>
          <div className="space-y-3">
            {data?.recentActivities?.slice(0, 8).map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className={`p-1 rounded ${
                    activity.type === 'borrowing' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {activity.type === 'borrowing' ? (
                      <ArrowRightLeft className={`h-4 w-4 text-blue-600`} />
                    ) : (
                      <PackageCheck className={`h-4 w-4 text-green-600`} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                  </div>
                </div>
                <span className={`${getStatusClass(activity.status)} text-xs`}>
                  {getStatusText(activity.status)}
                </span>
              </div>
            ))}
            {(!data?.recentActivities || data.recentActivities.length === 0) && (
              <p className="text-gray-500 text-center py-4">Tidak ada aktivitas terbaru</p>
            )}
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            Stok Rendah
          </h3>
          <div className="space-y-3">
            {data?.lowStockItems?.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.nama_barang}</p>
                  <p className="text-xs text-gray-500">{item.kategori}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-600">
                    {formatNumber(item.stok_current)} {item.satuan}
                  </p>
                  <p className="text-xs text-gray-500">
                    Min: {formatNumber(item.stok_minimal)}
                  </p>
                </div>
              </div>
            ))}
            {(!data?.lowStockItems || data.lowStockItems.length === 0) && (
              <div className="flex items-center justify-center py-4">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-green-600 text-sm">Semua stok dalam kondisi baik</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;