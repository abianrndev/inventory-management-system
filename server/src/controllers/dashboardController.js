const Item = require('../models/Item');
const Borrowing = require('../models/Borrowing');
const Receiving = require('../models/Receiving');

class DashboardController {
  // Get dashboard statistics
  static async getStats(req, res) {
    try {
      // Get total items
      const allItems = await Item.getAll();
      const totalItems = allItems.length;
      const totalStock = allItems.reduce((sum, item) => sum + item.stok_current, 0);

      // Get low stock items
      const lowStockItems = await Item.getLowStock();
      const lowStockCount = lowStockItems.length;

      // Get active borrowings
      const activeBorrowings = await Borrowing.getActive();
      const activeBorrowingsCount = activeBorrowings.length;

      // Get pending receivings
      const pendingReceivings = await Receiving.getPending();
      const pendingReceivingsCount = pendingReceivings.length;

      // Get recent activities (last 10)
      const recentBorrowings = await Borrowing.getAll();
      const recentReceivings = await Receiving.getAll();
      
      const recentActivities = [
        ...recentBorrowings.slice(0, 5).map(b => ({
          id: b.id,
          type: 'borrowing',
          description: `${b.peminjam} meminjam ${b.qty} ${b.satuan} ${b.nama_barang}`,
          date: b.tanggal_pinjam,
          status: b.status
        })),
        ...recentReceivings.slice(0, 5).map(r => ({
          id: r.id,
          type: 'receiving',
          description: `Terima ${r.qty} ${r.satuan} ${r.nama_barang} dari ${r.supplier}`,
          date: r.tanggal_terima,
          status: r.status_approval
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

      // Get category distribution
      const categoryStats = {};
      allItems.forEach(item => {
        if (categoryStats[item.kategori]) {
          categoryStats[item.kategori].count++;
          categoryStats[item.kategori].stock += item.stok_current;
        } else {
          categoryStats[item.kategori] = {
            count: 1,
            stock: item.stok_current
          };
        }
      });

      const categoryData = Object.keys(categoryStats).map(category => ({
        name: category,
        count: categoryStats[category].count,
        stock: categoryStats[category].stock
      }));

      res.json({
        summary: {
          totalItems,
          totalStock,
          lowStockCount,
          activeBorrowingsCount,
          pendingReceivingsCount
        },
        recentActivities,
        categoryData,
        lowStockItems: lowStockItems.slice(0, 5) // Top 5 low stock items
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get monthly trends
  static async getMonthlyTrends(req, res) {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const monthlyData = [];
      
      for (let i = 5; i >= 0; i--) {
        const month = ((currentMonth - i) % 12 + 12) % 12;
        const year = currentYear - (currentMonth - i < 0 ? 1 : 0);
        
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        
        const borrowings = await Borrowing.getByDateRange(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );
        
        const receivings = await Receiving.getByDateRange(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );

        monthlyData.push({
          month: startDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
          borrowings: borrowings.length,
          receivings: receivings.length,
          totalBorrowedQty: borrowings.reduce((sum, b) => sum + b.qty, 0),
          totalReceivedQty: receivings.filter(r => r.status_approval === 'approved').reduce((sum, r) => sum + r.qty, 0)
        });
      }

      res.json({ monthlyData });
    } catch (error) {
      console.error('Monthly trends error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = DashboardController;