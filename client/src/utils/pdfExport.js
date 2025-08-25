import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatDate, formatNumber } from './helpers';

// Configure jsPDF for Indonesian characters
const configureJsPDF = () => {
  // You can add custom fonts here if needed
  return new jsPDF();
};

export const exportBorrowingsToPDF = (borrowings, title = 'Laporan Peminjaman Barang') => {
  const doc = configureJsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text(title, 14, 20);
  
  // Subtitle with date
  doc.setFontSize(12);
  doc.text(`Tanggal Cetak: ${formatDate(new Date())}`, 14, 30);
  
  // Table data
  const tableData = borrowings.map(borrowing => [
    `#${borrowing.id}`,
    borrowing.nama_barang,
    borrowing.kategori,
    borrowing.nama_proyek,
    borrowing.peminjam,
    `${borrowing.qty} ${borrowing.satuan}`,
    formatDate(borrowing.tanggal_pinjam),
    borrowing.tanggal_kembali ? formatDate(borrowing.tanggal_kembali) : '-',
    borrowing.status === 'dipinjam' ? 'Dipinjam' : 'Dikembalikan',
    borrowing.keterangan || '-'
  ]);

  // Table headers
  const headers = [
    'ID', 'Barang', 'Kategori', 'Proyek', 'Peminjam', 
    'Jumlah', 'Tgl Pinjam', 'Tgl Kembali', 'Status', 'Keterangan'
  ];

  // Generate table
  doc.autoTable({
    head: [headers],
    body: tableData,
    startY: 40,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 15 }, // ID
      1: { cellWidth: 25 }, // Barang
      2: { cellWidth: 20 }, // Kategori
      3: { cellWidth: 25 }, // Proyek
      4: { cellWidth: 20 }, // Peminjam
      5: { cellWidth: 15 }, // Jumlah
      6: { cellWidth: 20 }, // Tgl Pinjam
      7: { cellWidth: 20 }, // Tgl Kembali
      8: { cellWidth: 20 }, // Status
      9: { cellWidth: 25 }, // Keterangan
    },
  });

  // Summary
  const activeBorrowings = borrowings.filter(b => b.status === 'dipinjam').length;
  const completedBorrowings = borrowings.filter(b => b.status === 'dikembalikan').length;
  
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text(`Total Peminjaman: ${borrowings.length}`, 14, finalY);
  doc.text(`Sedang Dipinjam: ${activeBorrowings}`, 14, finalY + 7);
  doc.text(`Sudah Dikembalikan: ${completedBorrowings}`, 14, finalY + 14);

  // Save the PDF
  doc.save(`laporan-peminjaman-${formatDate(new Date(), 'yyyy-MM-dd')}.pdf`);
};

export const exportReceivingsToPDF = (receivings, title = 'Laporan Penerimaan Barang') => {
  const doc = configureJsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text(title, 14, 20);
  
  // Subtitle with date
  doc.setFontSize(12);
  doc.text(`Tanggal Cetak: ${formatDate(new Date())}`, 14, 30);
  
  // Table data
  const tableData = receivings.map(receiving => [
    `#${receiving.id}`,
    receiving.nama_barang,
    receiving.kategori,
    receiving.supplier,
    `${receiving.qty} ${receiving.satuan}`,
    formatDate(receiving.tanggal_terima),
    receiving.status_approval === 'pending' ? 'Menunggu' :
      receiving.status_approval === 'approved' ? 'Disetujui' : 'Ditolak',
    receiving.created_by_username,
    receiving.approved_by_username || '-',
    receiving.approved_at ? formatDate(receiving.approved_at) : '-'
  ]);

  // Table headers
  const headers = [
    'ID', 'Barang', 'Kategori', 'Supplier', 'Jumlah', 
    'Tgl Terima', 'Status', 'Dibuat Oleh', 'Disetujui Oleh', 'Tgl Approval'
  ];

  // Generate table
  doc.autoTable({
    head: [headers],
    body: tableData,
    startY: 40,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 15 }, // ID
      1: { cellWidth: 25 }, // Barang
      2: { cellWidth: 20 }, // Kategori
      3: { cellWidth: 25 }, // Supplier
      4: { cellWidth: 15 }, // Jumlah
      5: { cellWidth: 20 }, // Tgl Terima
      6: { cellWidth: 20 }, // Status
      7: { cellWidth: 20 }, // Dibuat Oleh
      8: { cellWidth: 20 }, // Disetujui Oleh
      9: { cellWidth: 20 }, // Tgl Approval
    },
  });

  // Summary
  const pendingReceivings = receivings.filter(r => r.status_approval === 'pending').length;
  const approvedReceivings = receivings.filter(r => r.status_approval === 'approved').length;
  const rejectedReceivings = receivings.filter(r => r.status_approval === 'rejected').length;
  
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text(`Total Penerimaan: ${receivings.length}`, 14, finalY);
  doc.text(`Menunggu Approval: ${pendingReceivings}`, 14, finalY + 7);
  doc.text(`Disetujui: ${approvedReceivings}`, 14, finalY + 14);
  doc.text(`Ditolak: ${rejectedReceivings}`, 14, finalY + 21);

  // Save the PDF
  doc.save(`laporan-penerimaan-${formatDate(new Date(), 'yyyy-MM-dd')}.pdf`);
};

export const exportItemsToPDF = (items, title = 'Laporan Master Barang') => {
  const doc = configureJsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text(title, 14, 20);
  
  // Subtitle with date
  doc.setFontSize(12);
  doc.text(`Tanggal Cetak: ${formatDate(new Date())}`, 14, 30);
  
  // Table data
  const tableData = items.map(item => [
    `#${item.id}`,
    item.nama_barang,
    item.kategori,
    item.satuan,
    formatNumber(item.stok_current),
    formatNumber(item.stok_minimal),
    item.stok_current <= item.stok_minimal ? 'Stok Rendah' : 'Stok Aman',
    formatDate(item.created_at)
  ]);

  // Table headers
  const headers = [
    'ID', 'Nama Barang', 'Kategori', 'Satuan', 
    'Stok Saat Ini', 'Stok Minimal', 'Status Stok', 'Dibuat'
  ];

  // Generate table
  doc.autoTable({
    head: [headers],
    body: tableData,
    startY: 40,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [139, 92, 246],
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 20 }, // ID
      1: { cellWidth: 40 }, // Nama Barang
      2: { cellWidth: 30 }, // Kategori
      3: { cellWidth: 20 }, // Satuan
      4: { cellWidth: 25 }, // Stok Saat Ini
      5: { cellWidth: 25 }, // Stok Minimal
      6: { cellWidth: 25 }, // Status Stok
      7: { cellWidth: 25 }, // Dibuat
    },
  });

  // Summary
  const totalStock = items.reduce((sum, item) => sum + item.stok_current, 0);
  const lowStockItems = items.filter(item => item.stok_current <= item.stok_minimal).length;
  const categories = [...new Set(items.map(item => item.kategori))].length;
  
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text(`Total Barang: ${items.length}`, 14, finalY);
  doc.text(`Total Stok: ${formatNumber(totalStock)}`, 14, finalY + 7);
  doc.text(`Jumlah Kategori: ${categories}`, 14, finalY + 14);
  doc.text(`Barang Stok Rendah: ${lowStockItems}`, 14, finalY + 21);

  // Save the PDF
  doc.save(`laporan-master-barang-${formatDate(new Date(), 'yyyy-MM-dd')}.pdf`);
};