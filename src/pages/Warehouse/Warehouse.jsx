import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';

// --- MOCK DATA ---
const MATERIALS_DATA = [
  { code: 'NVL-BEEF-01', name: 'Thịt thăn bò Úc', note: 'Bảo quản ngăn đông (-18°C)', unit: 'kg', stock: 45.5, status: 'Còn hàng' },
  { code: 'NVL-RICE-02', name: 'Gạo thơm ST25', note: 'Kho khô tầng 1', unit: 'kg', stock: 120.0, status: 'Còn hàng' },
  { code: 'NVL-EGG-03', name: 'Trứng gà Ba Huân', note: 'Ngăn mát kho gia vị', unit: 'quả', stock: 35, status: 'Sắp hết' },
  { code: 'NVL-OIL-04', name: 'Dầu ăn Simply 5L', note: 'Kho thực phẩm khô', unit: 'bình', stock: 18, status: 'Còn hàng' },
  { code: 'NVL-BUTTER-05', name: 'Bơ lạt Anchor 1kg', note: 'Kho bơ sữa mát (4°C)', unit: 'khối', stock: 0.0, status: 'Hết hàng' },
  { code: 'NVL-MILK-06', name: 'Sữa tươi thanh trùng Đà Lạt Milk', note: 'Kho bảo quản lạnh', unit: 'lít', stock: 32.0, status: 'Còn hàng' },
  { code: 'NVL-SHRIMP-07', name: 'Tôm sú biển tươi sống', note: 'Bể sục hải sản tươi', unit: 'kg', stock: 14.2, status: 'Còn hàng' },
  { code: 'NVL-MUSH-08', name: 'Nấm hương rừng khô', note: 'Kệ gia vị khô số 4', unit: 'kg', stock: 3.5, status: 'Sắp hết' }
];

const AVAILABLE_MATERIALS = [
  { id: 'beef', name: 'Thịt thăn bò Úc', unit: 'kg', defaultPrice: 280000 },
  { id: 'rice', name: 'Gạo thơm ST25', unit: 'kg', defaultPrice: 28000 },
  { id: 'egg', name: 'Trứng gà Ba Huân', unit: 'quả', defaultPrice: 3200 },
  { id: 'oil', name: 'Dầu ăn Simply 5L', unit: 'bình', defaultPrice: 225000 },
  { id: 'butter', name: 'Bơ lạt Anchor 1kg', unit: 'khối', defaultPrice: 185000 },
  { id: 'milk', name: 'Sữa tươi Đà Lạt Milk', unit: 'lít', defaultPrice: 36000 },
  { id: 'shrimp', name: 'Tôm sú tươi sống', unit: 'kg', defaultPrice: 310000 },
  { id: 'mush', name: 'Nấm hương rừng khô', unit: 'kg', defaultPrice: 350000 }
];

const RAW_REPORT_DATASET = [
  { code: 'NVL-BEEF-01', name: 'Thịt thăn bò Úc', category: 'meat_seafood', unit: 'kg', imported: 25.0, currentStock: 45.5, unitPrice: 280000, threshold: 15.0 },
  { code: 'NVL-RICE-02', name: 'Gạo thơm ST25', category: 'spices_dry', unit: 'kg', imported: 60.0, currentStock: 120.0, unitPrice: 28000, threshold: 30.0 },
  { code: 'NVL-EGG-03', name: 'Trứng gà Ba Huân', category: 'dairy_egg', unit: 'quả', imported: 100.0, currentStock: 35.0, unitPrice: 3200, threshold: 50.0 },
  { code: 'NVL-OIL-04', name: 'Dầu ăn Simply 5L', category: 'spices_dry', unit: 'bình', imported: 10.0, currentStock: 18.0, unitPrice: 225000, threshold: 8.0 },
  { code: 'NVL-BUTTER-05', name: 'Bơ lạt Anchor 1kg', category: 'dairy_egg', unit: 'khối', imported: 0.0, currentStock: 0.0, unitPrice: 185000, threshold: 5.0 },
  { code: 'NVL-MILK-06', name: 'Sữa tươi thanh trùng Đà Lạt Milk', category: 'dairy_egg', unit: 'lít', imported: 30.0, currentStock: 32.0, unitPrice: 36000, threshold: 10.0 },
  { code: 'NVL-SHRIMP-07', name: 'Tôm sú biển tươi sống', category: 'meat_seafood', unit: 'kg', imported: 10.0, currentStock: 14.2, unitPrice: 310000, threshold: 6.0 },
  { code: 'NVL-MUSH-08', name: 'Nấm hương rừng khô', category: 'spices_dry', unit: 'kg', imported: 2.0, currentStock: 3.5, unitPrice: 350000, threshold: 5.0 }
];
 
const REPORT_PERIOD_RANGES = {
  week_this: { tuNgay: '2026-09-15', denNgay: '2026-09-21' },
  today: { tuNgay: '2026-09-25', denNgay: '2026-09-25' }
};

export default function Warehouse() {
  // GLOBAL STATES
  const [activeTab, setActiveTab] = useState('report'); // 'materials' | 'receipt' | 'report'
  const [toast, setToast] = useState(null);
  const [materials, setMaterials] = useState(() => MATERIALS_DATA.map(material => ({
    ...material,
    defaultPrice: AVAILABLE_MATERIALS.find(item => item.name === material.name)?.defaultPrice || 0
  })));

  // TAB 1: MATERIALS STATES
  const [materialSearch, setMaterialSearch] = useState('');
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [newMaterial, setNewMaterial] = useState({ name: '', unit: 'kg' });

  // TAB 2: RECEIPT STATES
  const [supplier, setSupplier] = useState('megafood');
  const [importReason, setImportReason] = useState('Nhập kho định kỳ đầu tuần');
  const [receiptRows, setReceiptRows] = useState([
    { id: 1, matName: 'Thịt thăn bò Úc', unit: 'kg', quantity: 20, price: 280000 },
    { id: 2, matName: 'Dầu ăn Simply 5L', unit: 'bình', quantity: 10, price: 225000 },
    { id: 3, matName: 'Trứng gà Ba Huân', unit: 'quả', quantity: 100, price: 3200 }
  ]);
  const [rowSequence, setRowSequence] = useState(4);
  const [receiptList, setReceiptList] = useState([]);
  const [receiptSearch, setReceiptSearch] = useState('');
  const [editingReceiptId, setEditingReceiptId] = useState(null);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [editingReceipt, setEditingReceipt] = useState(null);

  // TAB 3: REPORT STATES
  const [reportCriteria, setReportCriteria] = useState('period'); // 'period', 'date-range', 'category'
  const [reportPeriod, setReportPeriod] = useState('week_this');
  const [reportStartDate, setReportStartDate] = useState('2026-09-01');
  const [reportEndDate, setReportEndDate] = useState('2026-09-18');
  const [reportCategory, setReportCategory] = useState('all');
  const [reportSearchKeyword, setReportSearchKeyword] = useState('');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN').format(amount) + ' đ';

  const showToast = (title, desc, isWarning = false) => {
    setToast({ title, desc, isWarning });
    setTimeout(() => setToast(null), 3500);
  };

  // --- TAB 1 LOGIC ---
  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(materialSearch.toLowerCase()) || 
    m.code.toLowerCase().includes(materialSearch.toLowerCase())
  );

  const handleAddMaterial = (event) => {
    event.preventDefault();
    const name = newMaterial.name.trim();
    if (!name) {
      showToast('Không thể thêm nguyên vật liệu', 'Vui lòng nhập tên nguyên vật liệu.', true);
      return;
    }

    const createdMaterial = {
      code: `NVL-NEW-${Date.now().toString(36).toUpperCase()}`,
      name,
      note: '',
      unit: newMaterial.unit,
      stock: 0,
      status: 'Hết hàng',
      defaultPrice: 0,
      id: `new-${Date.now()}`
    };
    setMaterials(prev => [...prev, createdMaterial]);
    setNewMaterial({ name: '', unit: 'kg' });
    setIsMaterialModalOpen(false);
    showToast('Đã thêm nguyên vật liệu', `${name} đã sẵn sàng để chọn trong phiếu nhập kho.`);
  };

  const handleEditMaterial = (event) => {
    event.preventDefault();
    const name = editingMaterial.name.trim();
    if (!name) {
      showToast('Không thể cập nhật nguyên vật liệu', 'Vui lòng nhập tên nguyên vật liệu.', true);
      return;
    }

    const previousMaterial = materials.find(material => material.code === editingMaterial.code);
    setMaterials(prev => prev.map(material => material.code === editingMaterial.code
      ? { ...material, name, unit: editingMaterial.unit }
      : material
    ));
    if (previousMaterial && previousMaterial.name !== name) {
      setReceiptRows(prev => prev.map(row => row.matName === previousMaterial.name
        ? { ...row, matName: name, unit: editingMaterial.unit }
        : row
      ));
      setEditingReceipt(prev => prev && ({
        ...prev,
        rows: prev.rows.map(row => row.matName === previousMaterial.name
          ? { ...row, matName: name, unit: editingMaterial.unit }
          : row
        )
      }));
    }
    setEditingMaterial(null);
    showToast('Đã cập nhật nguyên vật liệu', `${name} đã được cập nhật thành công.`);
  };

  // --- TAB 2 LOGIC ---
  const handleAddReceiptRow = () => {
    const defaultMat = materials[0];
    setReceiptRows([...receiptRows, { id: rowSequence, matName: defaultMat.name, unit: defaultMat.unit, quantity: 10, price: defaultMat.defaultPrice }]);
    setRowSequence(prev => prev + 1);
  };

  const handleRemoveReceiptRow = (id) => {
    setReceiptRows(receiptRows.filter(r => r.id !== id));
  };

  const handleReceiptRowChange = (id, field, value) => {
    setReceiptRows(receiptRows.map(row => {
      if (row.id === id) {
        let updatedRow = { ...row, [field]: value };
        if (field === 'matName') {
          const matchedItem = materials.find(m => m.name === value);
          if (matchedItem) {
            updatedRow.unit = matchedItem.unit;
            updatedRow.price = matchedItem.defaultPrice;
          }
        }
        return updatedRow;
      }
      return row;
    }));
  };

  const receiptGrandTotal = receiptRows.reduce((sum, row) => sum + (Number(row.quantity) || 0) * (Number(row.price) || 0), 0);

  const supplierNames = {
    megafood: 'Công ty TNHH Thực Phẩm Tươi Sống MegaFood',
    cpfood: 'Tập đoàn Chăn nuôi & Thực phẩm CP Food Việt Nam',
    dalatgap: 'Đại lý Nông sản Đà Lạt Gap'
  };

  const handleSaveReceipt = () => {
    if (receiptRows.length === 0) {
      showToast('Lỗi Lưu Phiếu', 'Vui lòng thêm ít nhất một nguyên vật liệu vào phiếu nhập!', true);
      return;
    }
    const savedReceipt = {
      id: editingReceiptId || Date.now(),
      supplier,
      supplierName: supplierNames[supplier],
      reason: importReason,
      total: receiptGrandTotal,
      rows: receiptRows
    };

    setReceiptList(prev => editingReceiptId
      ? prev.map(receipt => receipt.id === editingReceiptId ? savedReceipt : receipt)
      : [savedReceipt, ...prev]
    );
    showToast(editingReceiptId ? 'Đã Cập Nhật Phiếu Nhập Kho!' : 'Đã Lưu Phiếu Nhập Kho Thành Công!', 'Phiếu nhập đã được chốt và đồng bộ vào thẻ kho.');
    setEditingReceiptId(null);
    setActiveTab('receipt-list');
  };

  const handleEditReceipt = (receipt) => {
    setEditingReceipt({ ...receipt, rows: receipt.rows.map(row => ({ ...row })) });
  };

  const handleEditReceiptRowChange = (id, field, value) => {
    setEditingReceipt(prev => ({
      ...prev,
      rows: prev.rows.map(row => {
        if (row.id !== id) return row;
        const updatedRow = { ...row, [field]: value };
        if (field === 'matName') {
          const matchedItem = materials.find(item => item.name === value);
          if (matchedItem) {
            updatedRow.unit = matchedItem.unit;
            updatedRow.price = matchedItem.defaultPrice;
          }
        }
        return updatedRow;
      })
    }));
  };

  const handleSaveEditedReceipt = () => {
    if (!editingReceipt || editingReceipt.rows.length === 0) {
      showToast('Lỗi Cập Nhật Phiếu', 'Vui lòng giữ lại ít nhất một nguyên vật liệu trong phiếu nhập!', true);
      return;
    }

    const total = editingReceipt.rows.reduce((sum, row) => sum + (Number(row.quantity) || 0) * (Number(row.price) || 0), 0);
    const updatedReceipt = {
      ...editingReceipt,
      supplierName: supplierNames[editingReceipt.supplier],
      total
    };

    setReceiptList(prev => prev.map(receipt => receipt.id === updatedReceipt.id ? updatedReceipt : receipt));
    setEditingReceipt(null);
    showToast('Đã Cập Nhật Phiếu Nhập Kho!', 'Phiếu nhập đã được cập nhật thành công.');
  };

  const handleViewReceipt = (receipt) => {
    setViewingReceipt(receipt);
  };

  const handleDeleteReceipt = (receiptId) => {
    setReceiptList(prev => prev.filter(receipt => receipt.id !== receiptId));
    showToast('Đã Xóa Phiếu Nhập Kho', 'Phiếu nhập đã được xóa khỏi danh sách.');
  };

  const filteredReceipts = receiptList.filter(receipt =>
    [receipt.supplierName, receipt.reason].some(value => value.toLowerCase().includes(receiptSearch.toLowerCase()))
  );

  // --- TAB 3 LOGIC ---
  const triggerTableReload = () => {
    setIsReloading(true);
    setTimeout(() => setIsReloading(false), 350);
  };

  let filteredReportData = RAW_REPORT_DATASET.filter(item => 
    item.name.toLowerCase().includes(reportSearchKeyword.toLowerCase()) || 
    item.code.toLowerCase().includes(reportSearchKeyword.toLowerCase())
  );

  let reportSummaryText = '';
  const reportDateRange = reportCriteria === 'period'
    ? REPORT_PERIOD_RANGES[reportPeriod]
    : { tuNgay: reportStartDate, denNgay: reportEndDate };

  if (reportCriteria === 'period') {
    if (reportPeriod === 'today') {
      filteredReportData = filteredReportData.slice(0, 6).map(item => ({
        ...item,
        imported: +(item.imported * 0.2).toFixed(1)
      }));
    }
    reportSummaryText = `Báo cáo theo kỳ từ ${reportDateRange.tuNgay} đến ${reportDateRange.denNgay} | Đối soát dữ liệu kho tự động.`;
  } else if (reportCriteria === 'date-range') {
    reportSummaryText = `Báo cáo theo khoảng ngày: Từ ${reportDateRange.tuNgay} đến ${reportDateRange.denNgay}.`;
  } else if (reportCriteria === 'category') {
    if (reportCategory !== 'all') {
      filteredReportData = filteredReportData.filter(item => item.category === reportCategory);
    }
    reportSummaryText = `Báo cáo theo nhóm vật tư chuyên biệt.`;
  }

  filteredReportData = filteredReportData.map(item => ({
    ...item,
    importedValue: item.imported * item.unitPrice,
    currentStockValue: item.currentStock * item.unitPrice
  }));

  const reportTotals = filteredReportData.reduce((acc, curr) => {
    acc.importedValue += curr.importedValue;
    acc.currentStockValue += curr.currentStockValue;
    return acc;
  }, { importedValue: 0, currentStockValue: 0 });

  const handleFinalizeReport = () => {
    showToast('Đã Chốt Báo Cáo Tồn Kho Thành Công!', 'Kỳ báo cáo đã được chốt sổ tồn. Số liệu đã được đồng bộ lên hệ thống kế toán NexusCore.');
  };

  const executeExport = (format) => {
    setIsExportMenuOpen(false);
    if (format === 'excel') showToast('Đang xuất file Excel (.xlsx)...', 'Báo cáo tồn kho đã được trích xuất dữ liệu thành công.');
    if (format === 'pdf') showToast('Đang tạo bản in PDF...', 'Bản sao lưu trữ báo cáo tồn kho đã sẵn sàng tải về.');
  };

  // --- CẤU HÌNH LAYOUT ---
  const topbarProps = {
    title: "Inventory",
    tagText: "Trực Tuyến",
    shiftInfo: "CA SÁNG (06:00 - 14:00)",
    userInfo: { name: "Lê Hoàng Nam", role: "Thủ Kho Tổng", initials: "HN" },
    icon: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>
  };

  const sidebarProps = {
    branchName: "KHO TRUNG TÂM",
    activeTab,
    setActiveTab,
    userInfo: { name: "Lê Hoàng Nam", role: "Thủ Kho Tổng", initials: "HN" },
    navItems: [
      {
        id: 'materials',
        label: 'Nguyên vật liệu',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m16.5 9.4-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" x2="12" y1="22.08" y2="12"></line></svg>
      },
      {
        id: 'receipt',
        label: 'Lập phiếu nhập kho',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" x2="12" y1="18" y2="12"></line><line x1="9" x2="15" y1="15" y2="15"></line></svg>
      },
      {
        id: 'receipt-list',
        label: 'Danh sách phiếu nhập',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13"></path><path d="M3 6h.01M3 12h.01M3 18h.01"></path></svg>
      },
      {
        id: 'report',
        label: 'Lập báo cáo tồn kho',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
      }
    ]
  };

  return (
    <MainLayout topbarProps={topbarProps} sidebarProps={sidebarProps}>
      
      {/* TAB 1: NGUYÊN VẬT LIỆU */}
      {activeTab === 'materials' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div><p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng mặt hàng</p><h3 className="text-2xl font-bold text-slate-900 mt-1">{materials.length}</h3></div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeLinecap="round" strokeLinejoin="round"></path></svg></div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div><p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Còn hàng ổn định</p><h3 className="text-2xl font-bold text-emerald-600 mt-1">{materials.filter(m => m.status === 'Còn hàng').length}</h3></div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"></path></svg></div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div><p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sắp hết hàng</p><h3 className="text-2xl font-bold text-amber-600 mt-1">{materials.filter(m => m.status === 'Sắp hết').length}</h3></div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round"></path></svg></div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div><p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Đã hết hàng</p><h3 className="text-2xl font-bold text-rose-600 mt-1">{materials.filter(m => m.status === 'Hết hàng').length}</h3></div>
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" strokeLinecap="round" strokeLinejoin="round"></path></svg></div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              </div>
              <input value={materialSearch} onChange={(e) => setMaterialSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400" placeholder="Tìm theo tên nguyên vật liệu, mã vật tư..." type="text" />
            </div>
            <div className="flex items-center space-x-2.5">
              <button onClick={() => {setMaterialSearch(''); showToast('Làm mới', 'Dữ liệu tồn kho được đồng bộ tức thời.');}} className="inline-flex items-center px-3.5 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <svg className="w-3.5 h-3.5 mr-1.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg> Làm mới
              </button>
              <button onClick={() => setIsMaterialModalOpen(true)} className="inline-flex items-center px-3.5 py-2 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg> Thêm NVL
              </button>
              <button onClick={() => setActiveTab('receipt')} className="inline-flex items-center px-3.5 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg> Lập phiếu nhập
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Tên nguyên vật liệu</th><th className="py-3 px-4">Mã vật tư</th><th className="py-3 px-4 text-center">Đơn vị</th><th className="py-3 px-4 text-right">Số lượng tồn</th><th className="py-3 px-4 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredMaterials.map(m => (
                    <tr key={m.code} className={`hover:bg-slate-50/70 transition-colors ${m.status === 'Sắp hết' ? 'bg-amber-50/30' : m.status === 'Hết hàng' ? 'bg-rose-50/30' : ''}`}>
                      <td className="py-3 px-4"><div className="font-semibold text-slate-800">{m.name}</div><div className="text-xs text-slate-400">{m.note}</div></td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-500">{m.code}</td>
                      <td className="py-3 px-4 text-center text-slate-600 font-medium">{m.unit}</td>
                      <td className={`py-3 px-4 text-right font-mono font-bold ${m.status === 'Sắp hết' ? 'text-amber-700' : m.status === 'Hết hàng' ? 'text-rose-600' : 'text-slate-800'}`}>{m.stock.toFixed(1)}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {m.status === 'Còn hàng' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Còn hàng</span>}
                          {m.status === 'Sắp hết' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Sắp hết</span>}
                          {m.status === 'Hết hàng' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">Hết hàng</span>}
                          <button type="button" onClick={() => setEditingMaterial({ code: m.code, name: m.name, unit: m.unit })} className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors">Sửa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredMaterials.length === 0 && <tr><td colSpan="5" className="py-6 text-center text-slate-400 text-sm">Không tìm thấy vật tư phù hợp.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-slate-50/60 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
              <span>Hiển thị {filteredMaterials.length} trên tổng số {materials.length} nguyên vật liệu</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DANH SÁCH PHIẾU NHẬP */}
      {activeTab === 'receipt-list' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Quản Lý Danh Sách Phiếu Nhập Kho</h2>
              <p className="text-xs text-slate-500 mt-0.5">Theo dõi và chỉnh sửa các phiếu nhập kho đã lưu.</p>
            </div>
            <button onClick={() => { setEditingReceiptId(null); setActiveTab('receipt'); }} className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              Lập phiếu nhập mới
            </button>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="m21 21-4.35-4.35m2.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              </div>
              <input value={receiptSearch} onChange={e => setReceiptSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600" placeholder="Tìm theo nhà cung cấp, lý do nhập..." type="text" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 min-w-[220px]">Nhà cung cấp</th>
                    <th className="py-3 px-4 text-right">Tổng tiền</th>
                    <th className="py-3 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredReceipts.map(receipt => (
                    <tr key={receipt.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-xs font-medium text-slate-800">{receipt.supplierName}</td>
                      <td className="py-3 px-4 text-right font-mono text-xs font-bold text-slate-900">{formatCurrency(receipt.total)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button onClick={() => handleViewReceipt(receipt)} className="text-xs font-semibold text-blue-600 hover:text-blue-800">Xem</button>
                          <button onClick={() => handleEditReceipt(receipt)} className="text-xs font-semibold text-slate-600 hover:text-slate-900">Sửa</button>
                          <button onClick={() => handleDeleteReceipt(receipt.id)} className="text-xs font-semibold text-rose-600 hover:text-rose-800">Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredReceipts.length === 0 && (
                    <tr>
                      <td colSpan="3" className="py-14 text-center">
                        <div className="text-sm font-medium text-slate-400">Chưa có dữ liệu phiếu nhập</div>
                        <div className="text-xs text-slate-400 mt-1">Các phiếu được lưu sẽ hiển thị tại đây.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-slate-50/60 border-t border-slate-200 text-xs text-slate-500">
              Hiển thị {filteredReceipts.length} trên tổng số {receiptList.length} phiếu nhập
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LẬP PHIẾU NHẬP KHO */}
      {activeTab === 'receipt' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Lập Phiếu Nhập Kho Mới</h2>
              <p className="text-xs text-slate-500 mt-0.5">Tạo phiếu nhập và cập nhật tăng số lượng tồn nguyên liệu vào kho trực tiếp</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">1. Thông tin phiếu nhập</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nhà cung cấp <span className="text-rose-500">*</span></label>
                <select value={supplier} onChange={e => setSupplier(e.target.value)} className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="megafood">Công ty TNHH Thực Phẩm Tươi Sống MegaFood</option>
                  <option value="cpfood">Tập đoàn Chăn nuôi & Thực phẩm CP Food Việt Nam</option>
                  <option value="dalatgap">Đại lý Nông sản Đà Lạt Gap</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Lý do nhập kho <span className="text-rose-500">*</span></label>
                <input value={importReason} onChange={e => setImportReason(e.target.value)} className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ví dụ: Nhập định kỳ..." type="text" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">2. Chi tiết danh mục hàng nhập</h3>
                <p className="text-xs text-slate-500 mt-0.5">Hệ thống sẽ tự động tính thành tiền theo số lượng và đơn giá</p>
              </div>
              <button onClick={handleAddReceiptRow} className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shadow-sm">
                <svg className="w-4 h-4 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg> + Thêm nguyên vật liệu
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3 text-center w-12">#</th>
                    <th className="py-3 px-4 min-w-[220px]">Chọn nguyên vật liệu</th>
                    <th className="py-3 px-3 text-center w-24">Đơn vị</th>
                    <th className="py-3 px-3 text-right w-32">Số lượng</th>
                    <th className="py-3 px-3 text-right w-40">Đơn giá (đ)</th>
                    <th className="py-3 px-4 text-right w-44">Thành tiền (đ)</th>
                    <th className="py-3 px-3 text-center w-14"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {receiptRows.map((row, index) => (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 text-center text-xs font-mono text-slate-400">{index + 1}</td>
                      <td className="py-2.5 px-4">
                        <select value={row.matName} onChange={(e) => handleReceiptRowChange(row.id, 'matName', e.target.value)} className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-md py-1.5 px-2 outline-none focus:ring-1 focus:ring-blue-500">
                          {materials.map(m => <option key={m.id || m.code} value={m.name}>{m.name}</option>)}
                        </select>
                      </td>
                      <td className="py-2.5 px-3 text-center"><span className="inline-block px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-semibold">{row.unit}</span></td>
                      <td className="py-2.5 px-3 text-right">
                        <input type="number" min="1" step="any" value={row.quantity} onChange={(e) => handleReceiptRowChange(row.id, 'quantity', e.target.value)} className="w-24 text-right text-xs font-mono font-medium text-slate-800 bg-white border border-slate-200 rounded-md py-1.5 px-2 outline-none focus:ring-1 focus:ring-blue-500" />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input type="number" min="0" step="1000" value={row.price} onChange={(e) => handleReceiptRowChange(row.id, 'price', e.target.value)} className="w-32 text-right text-xs font-mono font-medium text-slate-800 bg-white border border-slate-200 rounded-md py-1.5 px-2 outline-none focus:ring-1 focus:ring-blue-500" />
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 text-xs">{formatCurrency((Number(row.quantity)||0) * (Number(row.price)||0))}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button onClick={() => handleRemoveReceiptRow(row.id)} className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" title="Xóa dòng">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col md:flex-row items-end justify-between gap-4">
              <div className="text-xs text-slate-500">
                <div>* Đơn giá đã bao gồm thuế suất VAT và chi phí vận chuyển.</div>
                <div className="mt-0.5">Số lượng mặt hàng nhập: <span className="font-bold text-slate-700">{receiptRows.length}</span> món</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng tiền thanh toán:</span>
                <div className="text-2xl font-black text-blue-600 tracking-tight font-mono mt-0.5">{formatCurrency(receiptGrandTotal)}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button onClick={() => window.print()} className="inline-flex items-center px-4 py-2.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              <svg className="w-4 h-4 mr-1.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg> In phiếu nhập
            </button>
            <button onClick={handleSaveReceipt} className="inline-flex items-center px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg> Lưu Phiếu Lại
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: BÁO CÁO TỒN KHO */}
      {activeTab === 'report' && (
        <div className={`space-y-6 animate-in fade-in duration-200 ${isReloading ? 'opacity-50 transition-opacity' : 'opacity-100 transition-opacity'}`}>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-lg font-bold text-slate-900">Lập Báo Cáo Tồn Kho</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Báo cáo nhập kho trong kỳ và số lượng tồn kho hiện tại theo tiêu chí đã chọn</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div><p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng mặt hàng</p><h3 className="text-2xl font-bold text-slate-900 mt-1">{filteredReportData.length} <span className="text-xs font-normal text-slate-500">vật tư</span></h3></div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path></svg></div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div><p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng giá trị đã nhập (VNĐ)</p><h3 className="text-2xl font-bold text-emerald-600 mt-1">+{formatCurrency(reportTotals.importedValue)}</h3></div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"></path></svg></div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div><p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng giá trị tồn (VNĐ)</p><h3 className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(reportTotals.currentStockValue)}</h3></div>
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14"></path></svg></div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
              <div className="lg:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lập báo cáo theo:</label>
                <select value={reportCriteria} onChange={e => {setReportCriteria(e.target.value); triggerTableReload();}} className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="period">Theo Kỳ báo cáo (Tuần / Tháng / Quý)</option>
                  <option value="date-range">Theo Khoảng ngày cụ thể</option>
                  <option value="category">Theo Nhóm nguyên vật liệu</option>
                </select>
              </div>

              {reportCriteria === 'period' && (
                <div className="lg:col-span-5">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Chọn kỳ báo cáo:</label>
                  <select value={reportPeriod} onChange={e => {setReportPeriod(e.target.value); triggerTableReload();}} className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="week_this">Tuần 3 - Tháng 09/2026</option>
                    <option value="today">Hôm nay</option>
                  </select>
                </div>
              )}

              <div className="lg:col-span-3">
                <label className="block text-xs font-medium text-slate-500 mb-1">Tìm nhanh:</label>
                <input value={reportSearchKeyword} onChange={e => setReportSearchKeyword(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400" placeholder="Mã hoặc tên NVL..." type="text" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-3 text-center w-12">#</th>
                    <th className="py-3 px-3 w-32 font-mono">Mã vật tư</th>
                    <th className="py-3 px-4 min-w-[210px]">Tên nguyên vật liệu</th>
                    <th className="py-3 px-3 text-center w-20">ĐVT</th>
                    <th className="py-3 px-3 text-right w-36 text-emerald-700 bg-emerald-50/30">Nhập trong kỳ (VNĐ)</th>
                    <th className="py-3 px-3 text-right w-44 text-blue-900 bg-blue-50/30 font-bold">Tồn kho hiện tại (VNĐ)</th>
                    <th className="py-3 px-4 text-center w-36">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredReportData.map((item, idx) => {
                    let statusTag = '';
                    let rowBg = 'hover:bg-slate-50/70 transition-colors';
                    if (item.currentStock <= 0) {
                      statusTag = <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Hết hàng</span>;
                      rowBg += ' bg-rose-50/25';
                    } else if (item.currentStock < item.threshold) {
                      statusTag = <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Sắp hết</span>;
                      rowBg += ' bg-amber-50/25';
                    } else {
                      statusTag = <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Còn hàng</span>;
                    }
                    return (
                      <tr key={item.code} className={rowBg}>
                        <td className="py-2.5 px-3 text-center text-xs font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono text-xs font-semibold text-slate-600">{item.code}</td>
                        <td className="py-2.5 px-4 font-medium text-slate-900 text-xs">{item.name}</td>
                        <td className="py-2.5 px-3 text-center text-xs text-slate-600 font-medium">{item.unit}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-xs text-emerald-600 font-semibold bg-emerald-50/20">+{formatCurrency(item.importedValue)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-xs font-bold text-slate-900 bg-blue-50/20">{formatCurrency(item.currentStockValue)}</td>
                        <td className="py-2.5 px-4 text-center">{statusTag}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100/90 border-t-2 border-slate-300 font-semibold text-xs text-slate-800">
                    <td colSpan="4" className="py-3 px-4 text-slate-700 uppercase tracking-wider font-bold">Tổng cộng toàn kho:</td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-700 font-bold bg-emerald-50/60">+{formatCurrency(reportTotals.importedValue)}</td>
                    <td className="py-3 px-3 text-right font-mono text-blue-700 font-bold bg-blue-50/60">{formatCurrency(reportTotals.currentStockValue)}</td>
                    <td className="py-3 px-4 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">Đã đối soát</span></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="p-3.5 bg-slate-50/60 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span dangerouslySetInnerHTML={{ __html: reportSummaryText }}></span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-500 flex items-center space-x-1.5"><svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 01-18 0z"></path></svg><span>Tồn kho hiện tại được lấy trực tiếp từ dữ liệu tồn kho.</span></div>
            <div className="flex items-center space-x-3 relative">
              <button onClick={() => window.print()} className="inline-flex items-center px-4 py-2.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm transition-colors">In Báo Cáo</button>
              <div className="relative inline-block text-left">
                <button onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} className="inline-flex items-center px-4 py-2.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm transition-colors">Xuất Báo Cáo</button>
                {isExportMenuOpen && (
                  <div className="absolute right-0 bottom-full mb-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-30 divide-y divide-slate-100">
                    <button onClick={() => executeExport('excel')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50">Xuất file Excel (.xlsx)</button>
                    <button onClick={() => executeExport('pdf')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-rose-50">Xuất file PDF (.pdf)</button>
                  </div>
                )}
              </div>
              <button onClick={handleFinalizeReport} className="inline-flex items-center px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all">Lập / Chốt Báo Cáo</button>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT DETAIL MODAL */}
      {viewingReceipt && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center space-x-2.5">
                  <h3 className="font-bold text-lg text-slate-900">Chi Tiết Phiếu Nhập Kho</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Chế độ xem chỉ đọc danh mục hàng nhập</p>
              </div>
              <button onClick={() => setViewingReceipt(null)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors" title="Đóng">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-1">Nhà cung cấp</div>
                  <div className="text-sm font-semibold text-slate-800">{viewingReceipt.supplierName}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-1">Lý do nhập kho</div>
                  <div className="text-sm font-semibold text-slate-800">{viewingReceipt.reason}</div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Danh mục hàng nhập</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4 text-center w-12">#</th>
                        <th className="py-3 px-4">Nguyên vật liệu</th>
                        <th className="py-3 px-4 text-center">Đơn vị</th>
                        <th className="py-3 px-4 text-right">Số lượng</th>
                        <th className="py-3 px-4 text-right">Đơn giá (đ)</th>
                        <th className="py-3 px-4 text-right">Thành tiền (đ)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {viewingReceipt.rows.map((row, index) => (
                        <tr key={row.id}>
                          <td className="py-3 px-4 text-center text-xs font-mono text-slate-400">{index + 1}</td>
                          <td className="py-3 px-4 text-xs font-semibold text-slate-800">{row.matName}</td>
                          <td className="py-3 px-4 text-center text-xs text-slate-600">{row.unit}</td>
                          <td className="py-3 px-4 text-right text-xs font-mono text-slate-700">{row.quantity}</td>
                          <td className="py-3 px-4 text-right text-xs font-mono text-slate-700">{formatCurrency(Number(row.price) || 0)}</td>
                          <td className="py-3 px-4 text-right text-xs font-mono font-bold text-slate-900">{formatCurrency((Number(row.quantity) || 0) * (Number(row.price) || 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-4 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Số lượng mặt hàng nhập: <span className="font-bold text-slate-700">{viewingReceipt.rows.length}</span> món</span>
                  <div className="text-right">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng tiền thanh toán:</span>
                    <div className="text-xl font-black text-blue-600 tracking-tight font-mono">{formatCurrency(viewingReceipt.total)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end bg-white">
              <button onClick={() => setViewingReceipt(null)} className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT EDIT MODAL */}
      {editingReceipt && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Sửa Phiếu Nhập Kho</h3>
                <p className="text-xs text-slate-500 mt-0.5">Chỉnh sửa thông tin và danh mục hàng nhập trực tiếp</p>
              </div>
              <button onClick={() => setEditingReceipt(null)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors" title="Đóng">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nhà cung cấp</label>
                  <select value={editingReceipt.supplier} onChange={e => setEditingReceipt(prev => ({ ...prev, supplier: e.target.value }))} className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="megafood">Công ty TNHH Thực Phẩm Tươi Sống MegaFood</option>
                    <option value="cpfood">Tập đoàn Chăn nuôi & Thực phẩm CP Food Việt Nam</option>
                    <option value="dalatgap">Đại lý Nông sản Đà Lạt Gap</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Lý do nhập kho</label>
                  <input value={editingReceipt.reason} onChange={e => setEditingReceipt(prev => ({ ...prev, reason: e.target.value }))} className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" type="text" />
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Danh mục hàng nhập</h4>
                  <button onClick={() => setEditingReceipt(prev => ({ ...prev, rows: [...prev.rows, { id: Date.now(), matName: materials[0].name, unit: materials[0].unit, quantity: 1, price: materials[0].defaultPrice }] }))} className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                    Thêm nguyên vật liệu
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-3 text-center w-12">#</th>
                        <th className="py-3 px-3 min-w-[210px]">Nguyên vật liệu</th>
                        <th className="py-3 px-3 text-center">Đơn vị</th>
                        <th className="py-3 px-3 text-right">Số lượng</th>
                        <th className="py-3 px-3 text-right">Đơn giá (đ)</th>
                        <th className="py-3 px-3 text-right">Thành tiền (đ)</th>
                        <th className="py-3 px-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {editingReceipt.rows.map((row, index) => (
                        <tr key={row.id}>
                          <td className="py-2.5 px-3 text-center text-xs font-mono text-slate-400">{index + 1}</td>
                          <td className="py-2.5 px-3">
                            <select value={row.matName} onChange={e => handleEditReceiptRowChange(row.id, 'matName', e.target.value)} className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-md py-1.5 px-2 outline-none focus:ring-1 focus:ring-blue-500">
                              {materials.map(material => <option key={material.id || material.code} value={material.name}>{material.name}</option>)}
                            </select>
                          </td>
                          <td className="py-2.5 px-3 text-center"><span className="inline-block px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-semibold">{row.unit}</span></td>
                          <td className="py-2.5 px-3 text-right"><input type="number" min="1" step="any" value={row.quantity} onChange={e => handleEditReceiptRowChange(row.id, 'quantity', e.target.value)} className="w-20 text-right text-xs font-mono font-medium text-slate-800 bg-white border border-slate-200 rounded-md py-1.5 px-2 outline-none focus:ring-1 focus:ring-blue-500" /></td>
                          <td className="py-2.5 px-3 text-right"><input type="number" min="0" step="1000" value={row.price} onChange={e => handleEditReceiptRowChange(row.id, 'price', e.target.value)} className="w-28 text-right text-xs font-mono font-medium text-slate-800 bg-white border border-slate-200 rounded-md py-1.5 px-2 outline-none focus:ring-1 focus:ring-blue-500" /></td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 text-xs">{formatCurrency((Number(row.quantity) || 0) * (Number(row.price) || 0))}</td>
                          <td className="py-2.5 px-3 text-center"><button onClick={() => setEditingReceipt(prev => ({ ...prev, rows: prev.rows.filter(item => item.id !== row.id) }))} className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" title="Xóa dòng"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-4 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Số lượng mặt hàng nhập: <span className="font-bold text-slate-700">{editingReceipt.rows.length}</span> món</span>
                  <div className="text-right">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng tiền thanh toán:</span>
                    <div className="text-xl font-black text-blue-600 tracking-tight font-mono">{formatCurrency(editingReceipt.rows.reduce((sum, row) => sum + (Number(row.quantity) || 0) * (Number(row.price) || 0), 0))}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end space-x-3 bg-white">
              <button onClick={() => setEditingReceipt(null)} className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Hủy</button>
              <button onClick={handleSaveEditedReceipt} className="inline-flex items-center px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"><svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MATERIAL MODAL */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddMaterial} className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Thêm nguyên vật liệu</h3>
                <p className="text-xs text-slate-500 mt-0.5">Mã vật tư sẽ được hệ thống tự sinh.</p>
              </div>
              <button type="button" onClick={() => setIsMaterialModalOpen(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200" title="Đóng">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên nguyên vật liệu <span className="text-rose-500">*</span></label>
                <input required value={newMaterial.name} onChange={e => setNewMaterial(prev => ({ ...prev, name: e.target.value }))} className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nhập tên nguyên vật liệu" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Đơn vị <span className="text-rose-500">*</span></label>
                <select value={newMaterial.unit} onChange={e => setNewMaterial(prev => ({ ...prev, unit: e.target.value }))} className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="kg">kg</option><option value="quả">quả</option><option value="bình">bình</option><option value="khối">khối</option><option value="lít">lít</option><option value="gói">gói</option><option value="cái">cái</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end space-x-3 bg-slate-50/70">
              <button type="button" onClick={() => setIsMaterialModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Hủy</button>
              <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm">Thêm NVL</button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT MATERIAL MODAL */}
      {editingMaterial && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleEditMaterial} className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Sửa nguyên vật liệu</h3>
                <p className="text-xs text-slate-500 mt-0.5">Chỉ chỉnh sửa tên và đơn vị của vật tư.</p>
              </div>
              <button type="button" onClick={() => setEditingMaterial(null)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200" title="Đóng">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên nguyên vật liệu <span className="text-rose-500">*</span></label>
                <input required value={editingMaterial.name} onChange={e => setEditingMaterial(prev => ({ ...prev, name: e.target.value }))} className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Đơn vị <span className="text-rose-500">*</span></label>
                <select value={editingMaterial.unit} onChange={e => setEditingMaterial(prev => ({ ...prev, unit: e.target.value }))} className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="kg">kg</option><option value="quả">quả</option><option value="bình">bình</option><option value="khối">khối</option><option value="lít">lít</option><option value="gói">gói</option><option value="cái">cái</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end space-x-3 bg-slate-50/70">
              <button type="button" onClick={() => setEditingMaterial(null)} className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Hủy</button>
              <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm">Lưu thay đổi</button>
            </div>
          </form>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 max-w-sm bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 z-50 flex items-center space-x-3 transition-all">
          <div className={`w-8 h-8 rounded-full ${toast.isWarning ? 'bg-amber-500' : 'bg-emerald-500'} text-white flex items-center justify-center flex-shrink-0`}>✓</div>
          <div className="flex-1">
            <div className="text-xs font-bold text-slate-100">{toast.title}</div>
            <div className="text-[11px] text-slate-300 mt-0.5">{toast.desc}</div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}