import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';

// --- MOCK DATA ---
const INITIAL_DISHES = [
  { id: 1, name: "Bò Fuji nướng đá sốt tiêu đen", category: "Lẩu & Nướng", unit: "Phần", price: 285000, status: "active" },
  { id: 2, name: "Lẩu cá tầm Sapa lá giang", category: "Lẩu & Nướng", unit: "Nồi", price: 450000, status: "active" },
  { id: 3, name: "Cơm chiên hải sản hoàng bào", category: "Món chính", unit: "Đĩa", price: 165000, status: "active" },
  { id: 4, name: "Nem cua bể Hải Phòng", category: "Khai vị", unit: "Đĩa", price: 120000, status: "active" },
  { id: 5, name: "Sinh tố xoài cát Hòa Lộc", category: "Tráng miệng & Đồ uống", unit: "Ly", price: 55000, status: "active" },
  { id: 22, name: "Bò Wagyu A5 nướng than hoa", category: "Lẩu & Nướng", unit: "Phần", price: 680000, status: "inactive" },
  { id: 23, name: "Cua tuyết hấp gừng hành", category: "Món chính", unit: "Phần", price: 850000, status: "inactive" }
];

const INITIAL_SUPPLIERS = [
  { id: 1, name: "Công ty CP Thực phẩm Sao Mai", phone: "0903 123 456", color: "bg-blue-100 text-blue-700" },
  { id: 2, name: "Nông Sản Xanh Đà Lạt", phone: "0918 888 999", color: "bg-emerald-100 text-emerald-700" },
  { id: 3, name: "Hải Sản Tươi Sống Biển Đông", phone: "0934 567 890", color: "bg-cyan-100 text-cyan-700" },
  { id: 4, name: "Gia Vị & Thực Phẩm An Phát", phone: "0945 678 123", color: "bg-amber-100 text-amber-700" }
];

const REPORT_REVENUE_DATA = [
  { id: 1, date: 'Thứ Hai - 12/09/2026', orders: 45, sales: 17500000, vat: 1400000, net: 18900000 },
  { id: 2, date: 'Thứ Ba - 13/09/2026', orders: 48, sales: 18200000, vat: 1456000, net: 19656000 },
  { id: 3, date: 'Thứ Tư - 14/09/2026', orders: 50, sales: 19150000, vat: 1532000, net: 20682000 },
  { id: 4, date: 'Thứ Năm - 15/09/2026', orders: 52, sales: 20400000, vat: 1632000, net: 22032000 },
  { id: 5, date: 'Thứ Sáu - 16/09/2026', orders: 61, sales: 24600000, vat: 1968000, net: 26568000 }
];

export default function Manager() {
  // GLOBAL STATES
  const [activeTab, setActiveTab] = useState('dishes');
  const [toast, setToast] = useState(null);

  // DISHES STATES
  const [dishes, setDishes] = useState(INITIAL_DISHES);
  const [dishSearch, setDishSearch] = useState('');
  const [dishCategory, setDishCategory] = useState('ALL');
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [dishForm, setDishForm] = useState({ id: null, name: '', category: 'Món chính', unit: '', price: '', status: 'active' });

  // SUPPLIERS STATES
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ id: null, name: '', phone: '' });

  // REPORTS STATES
  const [reportType, setReportType] = useState('revenue'); // revenue, inventory, topseller
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN').format(amount) + ' đ';

  const showToast = (message, isSuccess = true) => {
    setToast({ message, isSuccess });
    setTimeout(() => setToast(null), 2500);
  };

  // --- DISHES LOGIC ---
  const filteredDishes = dishes.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(dishSearch.toLowerCase());
    const matchCat = dishCategory === 'ALL' || d.category === dishCategory;
    return matchSearch && matchCat;
  });

  const totalDishes = dishes.length;
  const activeDishes = dishes.filter(d => d.status === 'active').length;
  const avgPrice = Math.round(dishes.reduce((sum, d) => sum + d.price, 0) / (totalDishes || 1));

  const openDishModal = (dish = null) => {
    if (dish) setDishForm(dish);
    else setDishForm({ id: null, name: '', category: 'Món chính', unit: '', price: '', status: 'active' });
    setIsDishModalOpen(true);
  };

  const handleSaveDish = (e) => {
    e.preventDefault();
    if (dishForm.id) {
      setDishes(dishes.map(d => d.id === dishForm.id ? { ...dishForm, price: Number(dishForm.price) } : d));
      showToast(`Đã cập nhật món "${dishForm.name}" thành công!`);
    } else {
      const newId = dishes.length > 0 ? Math.max(...dishes.map(d => d.id)) + 1 : 1;
      setDishes([{ ...dishForm, id: newId, price: Number(dishForm.price) }, ...dishes]);
      showToast(`Đã thêm món "${dishForm.name}" vào thực đơn!`);
    }
    setIsDishModalOpen(false);
  };

  // --- SUPPLIERS LOGIC ---
  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(supplierSearch.toLowerCase()) || 
    s.phone.replace(/\s/g, '').includes(supplierSearch.replace(/\s/g, ''))
  );

  const getInitials = (name) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const openSupplierModal = (supplier = null) => {
    if (supplier) setSupplierForm(supplier);
    else setSupplierForm({ id: null, name: '', phone: '' });
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplier = (e) => {
    e.preventDefault();
    if (supplierForm.id) {
      setSuppliers(suppliers.map(s => s.id === supplierForm.id ? { ...s, name: supplierForm.name, phone: supplierForm.phone } : s));
      showToast(`Đã cập nhật thông tin "${supplierForm.name}" thành công!`);
    } else {
      const newId = suppliers.length > 0 ? Math.max(...suppliers.map(s => s.id)) + 1 : 1;
      const palettes = ["bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700", "bg-cyan-100 text-cyan-700", "bg-amber-100 text-amber-700", "bg-purple-100 text-purple-700", "bg-rose-100 text-rose-700"];
      setSuppliers([{ ...supplierForm, id: newId, color: palettes[newId % palettes.length] }, ...suppliers]);
      showToast(`Đã thêm nhà cung cấp "${supplierForm.name}" thành công!`);
    }
    setIsSupplierModalOpen(false);
  };

  // --- REPORTS LOGIC ---
  const handleExport = (format) => {
    setIsExportMenuOpen(false);
    if (format === 'excel') showToast('Đang xuất file Excel (.xlsx)...');
    else showToast('Đang tạo bản in PDF...');
  };

  // --- CẤU HÌNH LAYOUT ---
  const topbarProps = {
    title: "Management",
    tagText: "Trực Tuyến",
    shiftInfo: "CA QUẢN LÝ (08:00 - 22:00)",
    userInfo: { name: "Trần Minh Quân", role: "Quản Lý Nhà Hàng", initials: "QL" },
    icon: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
  };

  const sidebarProps = {
    branchName: "CHI NHÁNH TRUNG TÂM",
    activeTab,
    setActiveTab,
    userInfo: { name: "Trần Minh Quân", role: "Quản Lý Nhà Hàng", initials: "QL" },
    navItems: [
      {
        id: 'dishes',
        label: 'Món ăn',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
      },
      {
        id: 'suppliers',
        label: 'Nhà cung cấp',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h2m-6 0a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z"></path></svg>
      },
      {
        id: 'reports',
        label: 'Báo cáo',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
      }
    ]
  };

  return (
    <MainLayout topbarProps={topbarProps} sidebarProps={sidebarProps}>
      
      {/* TAB 1: DISHES */}
      {activeTab === 'dishes' && (
        <section className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Quản Lý Danh Sách Món Ăn</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">Theo dõi, thêm mới và cập nhật trạng thái món ăn trong thực đơn của nhà hàng</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div><div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">TỔNG SỐ MÓN</div><div className="text-2xl font-bold text-slate-900 mt-1">{totalDishes}</div></div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg></div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div><div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">CÒN PHỤC VỤ</div><div className="text-2xl font-bold text-emerald-600 mt-1">{activeDishes}</div></div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div><div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">TẠM NGƯNG</div><div className="text-2xl font-bold text-amber-600 mt-1">{totalDishes - activeDishes}</div></div>
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div><div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">GIÁ BÁN TB</div><div className="text-2xl font-bold text-blue-700 mt-1">{formatCurrency(avgPrice)}</div></div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">₫</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input value={dishSearch} onChange={e => setDishSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50/50" placeholder="Tìm nhanh tên món..." type="text" />
              </div>
              <div className="w-full sm:w-56">
                <select value={dishCategory} onChange={e => setDishCategory(e.target.value)} className="w-full py-2 pl-3 pr-8 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium">
                  <option value="ALL">Tất cả loại món</option>
                  <option value="Khai vị">Món khai vị</option>
                  <option value="Món chính">Món chính</option>
                  <option value="Lẩu & Nướng">Món lẩu & nướng</option>
                  <option value="Tráng miệng & Đồ uống">Tráng miệng & Đồ uống</option>
                </select>
              </div>
            </div>
            <div className="w-full md:w-auto flex justify-end">
              <button onClick={() => openDishModal()} className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-sm transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                <span>+ Thêm Món Mới</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col flex-1">
            <div className="overflow-auto max-h-[480px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 z-20 bg-slate-100">
                  <tr className="border-b border-slate-200 text-slate-600 font-semibold tracking-wider text-[11px] uppercase">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Tên Món Ăn</th><th className="py-3 px-4">Loại Món</th><th className="py-3 px-4 text-center">ĐVT</th><th className="py-3 px-4 text-right">Đơn Giá</th><th className="py-3 px-4 text-center">Trạng Thái</th><th className="py-3 px-4 text-center w-24">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDishes.map((dish, idx) => {
                    let catColor = "bg-slate-100 text-slate-700";
                    if (dish.category === "Khai vị") catColor = "bg-amber-50 text-amber-700 border-amber-200";
                    else if (dish.category === "Món chính") catColor = "bg-blue-50 text-blue-700 border-blue-200";
                    else if (dish.category === "Lẩu & Nướng") catColor = "bg-rose-50 text-rose-700 border-rose-200";
                    else if (dish.category === "Tráng miệng & Đồ uống") catColor = "bg-purple-50 text-purple-700 border-purple-200";

                    return (
                      <tr key={dish.id} className="hover:bg-blue-50/40 transition-colors group">
                        <td className="py-3 px-4 text-center font-mono text-slate-400 text-[11px]">{idx + 1}</td>
                        <td className="py-3 px-4 font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{dish.name}</td>
                        <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-md text-[11px] border font-medium ${catColor}`}>{dish.category}</span></td>
                        <td className="py-3 px-4 text-center text-slate-600 font-medium">{dish.unit}</td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-900 font-mono">{formatCurrency(dish.price)}</td>
                        <td className="py-3 px-4 text-center">
                          {dish.status === 'active' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><span className="w-1 h-1 rounded-full bg-emerald-500 mr-1.5"></span>Còn phục vụ</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200"><span className="w-1 h-1 rounded-full bg-slate-400 mr-1.5"></span>Ngưng phục vụ</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button onClick={() => openDishModal(dish)} className="inline-flex items-center space-x-1 text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            <span className="text-[11px] font-medium">Sửa</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  {filteredDishes.length === 0 && (
                    <tr><td colSpan="7" className="py-8 text-center text-slate-400">Không tìm thấy món ăn nào.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: SUPPLIERS */}
      {activeTab === 'suppliers' && (
        <section className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Quản Lý Nhà Cung Cấp</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">Theo dõi, cập nhật thông tin đối tác cung ứng</p>
            </div>
            <button onClick={() => openSupplierModal()} className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-sm transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              <span>+ Thêm Nhà Cung Cấp</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div><div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">TỔNG SỐ ĐỐI TÁC</div><div className="text-2xl font-bold text-slate-900 mt-1">{suppliers.length}</div></div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg></div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input value={supplierSearch} onChange={e => setSupplierSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50/50" placeholder="Tìm tên nhà cung cấp hoặc số điện thoại..." type="text" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col flex-1">
            <div className="overflow-auto max-h-[480px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 z-20 bg-slate-100">
                  <tr className="border-b border-slate-200 text-slate-600 font-semibold tracking-wider text-[11px] uppercase">
                    <th className="py-3 px-4 w-12 text-center">#</th><th className="py-3 px-4">Tên Nhà Cung Cấp</th><th className="py-3 px-4">Số Điện Thoại</th><th className="py-3 px-4 text-center w-28">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSuppliers.map((sup, idx) => (
                    <tr key={sup.id} className="hover:bg-blue-50/40 transition-colors group">
                      <td className="py-3 px-4 text-center font-mono text-slate-400 text-[11px]">{idx + 1}</td>
                      <td className="py-3 px-4 font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg ${sup.color} flex items-center justify-center font-bold text-xs border border-slate-200/50`}>{getInitials(sup.name)}</div>
                          <div>
                            <span className="font-medium text-slate-900 block text-xs leading-snug">{sup.name}</span>
                            <span className="text-[11px] text-slate-400">Đối tác cung ứng</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
                          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                          <span>{sup.phone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button onClick={() => openSupplierModal(sup)} className="inline-flex items-center space-x-1 text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-2.5 py-1 rounded transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                          <span className="text-[11px] font-medium">Sửa</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredSuppliers.length === 0 && (
                    <tr><td colSpan="4" className="py-8 text-center text-slate-400">Không tìm thấy nhà cung cấp nào.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* TAB 3: REPORTS */}
      {activeTab === 'reports' && (
        <section className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Trung Tâm Báo Cáo & Thống Kê</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">Tổng hợp số liệu doanh thu, hàng tồn kho và hiệu suất bán hàng của nhà hàng</p>
            </div>
            <div className="flex items-center space-x-2 relative">
              <button onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} className="inline-flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-xs px-3.5 py-2 rounded-lg shadow-sm transition-colors">
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <span>Xuất Báo Cáo</span>
              </button>
              {isExportMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-30 divide-y divide-slate-100">
                  <button onClick={() => handleExport('excel')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center space-x-2"><svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><span>Xuất file Excel</span></button>
                  <button onClick={() => handleExport('pdf')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-800 flex items-center space-x-2"><svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg><span>Xuất file PDF</span></button>
                </div>
              )}
              <button onClick={() => window.print()} className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-2 rounded-lg shadow-sm transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                <span>In Báo Cáo</span>
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Loại Báo Cáo:</label>
                <div className="inline-flex p-1 bg-slate-100 rounded-lg w-full">
                  <button onClick={() => setReportType('revenue')} className={`flex-1 py-1.5 px-3 rounded-md text-xs transition-all font-semibold ${reportType === 'revenue' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Doanh Thu</button>
                  <button onClick={() => {setReportType('inventory'); showToast('Mô-đun tồn kho đang cập nhật số liệu');}} className={`flex-1 py-1.5 px-3 rounded-md text-xs transition-all font-semibold ${reportType === 'inventory' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Tồn Kho</button>
                  <button onClick={() => {setReportType('topseller'); showToast('Mô-đun món bán chạy đang cập nhật');}} className={`flex-1 py-1.5 px-3 rounded-md text-xs transition-all font-semibold ${reportType === 'topseller' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Bán Chạy</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kỳ Báo Cáo:</label>
                <select className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:ring-2 focus:ring-blue-500 outline-none text-slate-700">
                  <option value="week">Tuần này</option>
                  <option value="today">Hôm nay (24 giờ qua)</option>
                  <option value="month">Tháng 09/2026</option>
                  <option value="quarter">Quý 3 - 2026</option>
                </select>
              </div>
              <div className="flex items-center justify-between border-l border-slate-100 pl-4">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-600">Dữ liệu báo cáo tự động</span>
                </div>
                <button onClick={() => showToast('Đã làm mới số liệu báo cáo thành công!')} className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium shadow-sm transition-colors">
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  <span>Làm mới</span>
                </button>
              </div>
            </div>
          </div>

          {/* HIỂN THỊ NỘI DUNG TƯƠNG ỨNG VỚI LOẠI BÁO CÁO */}
          {reportType === 'revenue' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">TỔNG DOANH THU</span>
                  <div className="text-2xl font-bold text-blue-600 mt-1">142.850.000 đ</div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-0.5">↑ +14.2% so với kỳ trước</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">TỔNG HÓA ĐƠN</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">256 đơn</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">trung bình 51 đơn / ngày</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">GIÁ TRỊ TB / ĐƠN</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">558.000 đ</div>
                  <div className="text-[11px] text-blue-600 font-medium mt-0.5">Bàn khách 3-4 người</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">THỰC THU SAU THUẾ</span>
                  <div className="text-2xl font-bold text-emerald-600 mt-1">107.838.000 đ</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Bao gồm 8% VAT</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col flex-1">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">Chi Tiết Doanh Thu Theo Ngày Trong Kỳ</h4>
                  <span className="text-xs text-slate-400">Đơn vị: Việt Nam Đồng</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold tracking-wider text-[11px] uppercase">
                        <th className="py-3 px-4 w-12 text-center">#</th><th className="py-3 px-4">Ngày Hoạt Động</th><th className="py-3 px-4 text-center">Số Lượng Đơn</th><th className="py-3 px-4 text-right">Doanh Số Bán</th><th className="py-3 px-4 text-right">Thuế VAT (8%)</th><th className="py-3 px-4 text-right">Thực Thu</th><th className="py-3 px-4 text-center">Đối Soát</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {REPORT_REVENUE_DATA.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-slate-50/60">
                          <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{row.date}</td>
                          <td className="py-3 px-4 text-center">{row.orders} đơn</td>
                          <td className="py-3 px-4 text-right font-mono font-medium">{formatCurrency(row.sales)}</td>
                          <td className="py-3 px-4 text-right font-mono text-slate-500">{formatCurrency(row.vat)}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">{formatCurrency(row.net)}</td>
                          <td className="py-3 px-4 text-center"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-medium border border-emerald-200">Đã khớp</span></td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-blue-50/50 font-bold border-t-2 border-slate-200 text-slate-900">
                        <td colSpan="2" className="py-3.5 px-4 text-left uppercase">TỔNG CỘNG ĐẠI DIỆN:</td>
                        <td className="py-3.5 px-4 text-center text-blue-700">256 đơn</td>
                        <td className="py-3.5 px-4 text-right font-mono text-blue-700">{formatCurrency(99850000)}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-600">{formatCurrency(79880000)}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-emerald-700 text-sm">{formatCurrency(107838000)}</td>
                        <td className="py-3.5 px-4 text-center text-emerald-600">100% Khớp</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {reportType === 'inventory' && (
            <div className="bg-white p-10 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
              <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              <h3 className="text-lg font-bold text-slate-700">Đang cập nhật số liệu Tồn Kho</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-md">Mô-đun báo cáo tồn kho chuyên sâu đang được đồng bộ dữ liệu với bộ phận Kho. Vui lòng quay lại sau.</p>
            </div>
          )}

          {reportType === 'topseller' && (
            <div className="bg-white p-10 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
              <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              <h3 className="text-lg font-bold text-slate-700">Đang cập nhật số liệu Bán Chạy</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-md">Mô-đun phân tích hiệu suất món ăn bán chạy đang được xử lý. Vui lòng quay lại sau.</p>
            </div>
          )}
        </section>
      )}

      {/* MODALS */}
      {/* Dish Modal */}
      {isDishModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">{dishForm.id ? 'Chỉnh Sửa Món Ăn' : 'Thêm Món Ăn Mới'}</h3>
                <p className="text-xs text-slate-500">Cập nhật thông thực đơn chi nhánh</p>
              </div>
            </div>
            <form className="p-6 space-y-4 text-xs" onSubmit={handleSaveDish}>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên Món Ăn <span className="text-rose-500">*</span></label>
                <input className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs" required type="text" value={dishForm.name} onChange={e => setDishForm({...dishForm, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Loại Món <span className="text-rose-500">*</span></label>
                  <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs" required value={dishForm.category} onChange={e => setDishForm({...dishForm, category: e.target.value})}>
                    <option value="Món chính">Món chính</option>
                    <option value="Khai vị">Món khai vị</option>
                    <option value="Lẩu & Nướng">Món lẩu & nướng</option>
                    <option value="Tráng miệng & Đồ uống">Tráng miệng & Đồ uống</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Đơn Vị Tính <span className="text-rose-500">*</span></label>
                  <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs" required value={dishForm.unit} onChange={e => setDishForm({...dishForm, unit: e.target.value})}>
                    <option value="" disabled>Chọn đơn vị tính</option>
                    <option value="Đĩa">Đĩa</option>
                    <option value="Phần">Phần</option>
                    <option value="Nồi">Nồi</option>
                    <option value="Ly">Ly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Đơn Giá Bán (VND) <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <input className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs pr-10 font-mono" min="1000" required step="1000" type="number" value={dishForm.price} onChange={e => setDishForm({...dishForm, price: e.target.value})} />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 font-semibold">₫</span>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-2">Trạng Thái Phục Vụ</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center p-2.5 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input className="text-blue-600 focus:ring-blue-500" name="formDishStatus" type="radio" value="active" checked={dishForm.status === 'active'} onChange={() => setDishForm({...dishForm, status: 'active'})} />
                    <span className="ml-2 text-xs font-medium text-emerald-700">Còn phục vụ</span>
                  </label>
                  <label className="flex items-center p-2.5 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input className="text-blue-600 focus:ring-blue-500" name="formDishStatus" type="radio" value="inactive" checked={dishForm.status === 'inactive'} onChange={() => setDishForm({...dishForm, status: 'inactive'})} />
                    <span className="ml-2 text-xs font-medium text-slate-600">Ngưng phục vụ</span>
                  </label>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" onClick={() => setIsDishModalOpen(false)} type="button">Hủy bỏ</button>
                <button className="px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm shadow-blue-200 transition-colors" type="submit">Lưu Món Ăn</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">{supplierForm.id ? 'Chỉnh Sửa Nhà Cung Cấp' : 'Thêm Nhà Cung Cấp Mới'}</h3>
                <p className="text-xs text-slate-500">Cập nhật thông tin đối tác cung ứng</p>
              </div>
            </div>
            <form className="p-6 space-y-4 text-xs" onSubmit={handleSaveSupplier}>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên Nhà Cung Cấp <span className="text-rose-500">*</span></label>
                <input className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs" required type="text" value={supplierForm.name} onChange={e => setSupplierForm({...supplierForm, name: e.target.value})} />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số Điện Thoại <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <input className="w-full px-3 py-2 pl-9 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono" required type="tel" value={supplierForm.phone} onChange={e => setSupplierForm({...supplierForm, phone: e.target.value})} />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" onClick={() => setIsSupplierModalOpen(false)} type="button">Hủy</button>
                <button className="px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm shadow-blue-200 transition-colors" type="submit">Lưu Thông Tin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center space-x-3 text-xs z-50 animate-in fade-in duration-300">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${toast.isSuccess ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

    </MainLayout>
  );
}