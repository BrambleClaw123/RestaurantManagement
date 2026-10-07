import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import MainLayout from '../../components/layout/MainLayout';

export default function Waiter() {
  // GLOBAL STATES
  const [activeTab, setActiveTab] = useState('map');
  const [toast, setToast] = useState(null);
  const user = JSON.parse(localStorage.getItem('nexus_user') || '{}');

  // TABLE STATES
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState(null);

  const fetchTables = async () => {
    try {
      const data = await api.get('/api/phuc-vu/ban');
      const formattedTables = data.map(b => ({
        id: b.maBan,
        name: b.tenBan,
        code: b.maPhieuGM ? '#ORD-' + b.maPhieuGM : null,
        status: b.trangThai === 'Trống' ? 'empty' : b.trangThai === 'Đã đặt' ? 'reserved' : 'serving',
        orderId: b.maPhieuGM,
        orders: []
      }));
      setTables(formattedTables);

      if (selectedTableId) {
        fetchTableDetails(selectedTableId);
      }
    } catch (e) { }
  };

  const fetchTableDetails = async (maBan) => {
    if (!maBan) return;
    try {
      const data = await api.get(`/api/phuc-vu/ban/${maBan}`);
      setTables(prev => prev.map(t => {
        if (t.id === maBan) {
          return {
            ...t,
            code: data.maPhieuGM ? '#ORD-' + data.maPhieuGM : null,
            status: data.trangThai === 'Trống' ? 'empty' : data.trangThai === 'Đã đặt' ? 'reserved' : 'serving',
            orderId: data.maPhieuGM,
            reservationCustomer: data.tenKhachDatBan,
            reservationTime: data.thoiGianDatBan,
            orders: (data.danhSachMon || []).map(m => ({
              id: m.id,
              maMon: m.maMon,
              name: m.tenMon,
              qty: m.soLuong,
              status: m.trangThaiBep || 'Chờ chế biến',
              price: m.donGia,
              note: m.ghiChu || ''
            }))
          };
        }
        return t;
      }));
    } catch (e) { }
  };

  const fetchMenu = async () => {
    try {
      const data = await api.get('/api/phuc-vu/thuc-don');
      const formattedMenu = data.map(m => ({
        id: m.maMon,
        name: m.tenMon,
        price: m.donGia,
        category: m.loaiMon === 'MON_CHINH' ? 'main'
          : m.loaiMon === 'LAU_NUONG' ? 'hotpot'
            : m.loaiMon === 'MON_KHAI_VI' ? 'appetizer'
              : m.loaiMon === 'THUC_UONG' ? 'beverage'
                : m.loaiMon === 'TRANG_MIENG' ? 'dessert'
                  : 'all',
        desc: ''
      }));
      setMenuItems(formattedMenu);
    } catch (e) { }
  };

  useEffect(() => {
    fetchTables();
    fetchMenu();
  }, []);

  useEffect(() => {
    if (selectedTableId) {
      fetchTableDetails(selectedTableId);
    }
  }, [selectedTableId]);

  // MODAL & INLINE EDIT STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [modalSelections, setModalSelections] = useState({});
  const [editingItem, setEditingItem] = useState(null);

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN').format(amount) + 'đ';

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- ACTIONS ---
  const selectedTable = tables.find(t => t.id === selectedTableId);
  const { emptyCount, servingCount, reservedCount } = tables.reduce((acc, table) => {
    if (table.status === 'empty') acc.emptyCount++;
    if (table.status === 'serving') acc.servingCount++;
    if (table.status === 'reserved') acc.reservedCount++;
    return acc;
  }, { emptyCount: 0, servingCount: 0, reservedCount: 0 });

  const handleTableSelect = (tableId) => {
    setSelectedTableId(tableId);
    setEditingItem(null); // Reset trạng thái sửa khi đổi bàn
  };

  const handleRemoveOrderItem = async (itemIndex) => {
    const item = selectedTable.orders[itemIndex];
    if (item.status !== 'Chờ chế biến') {
      showToast('Chỉ có thể xóa món đang ở trạng thái "Chờ chế biến"!', 'warning');
      return;
    }
    try {
      await api.delete(`/api/phuc-vu/chi-tiet-mon/${item.id}`);
      fetchTableDetails(selectedTableId);
      showToast(`Đã xóa món "${item.name}" khỏi bàn!`, 'info');
    } catch (e) {
      showToast(e.message || 'Không thể xóa món', 'error');
    }
  };

  // --- INLINE EDIT LOGIC ---
  const startEditOrderItem = (idx, item) => {
    if (item.status !== 'Chờ chế biến') {
      showToast('Chỉ có thể sửa món đang ở trạng thái "Chờ chế biến"!', 'warning');
      return;
    }
    setEditingItem({ index: idx, qty: item.qty, note: item.note || '' });
  };

  const saveEditOrderItem = async () => {
    if (!editingItem) return;
    const item = selectedTable.orders[editingItem.index];
    try {
      await api.put(`/api/phuc-vu/chi-tiet-mon/${item.id}`, { soLuongMoi: editingItem.qty });
      fetchTableDetails(selectedTableId);
      setEditingItem(null);
      showToast('Cập nhật số lượng thành công!', 'success');
    } catch (e) {
      showToast(e.message || 'Lỗi cập nhật', 'error');
    }
  };

  const cancelEditOrderItem = () => {
    setEditingItem(null);
  };

  const handlePrimaryAction = async () => {
    if (selectedTable.status === 'reserved') {
      const confirmMsg = `Bàn này đang được giữ cho:\n- Khách hàng: ${selectedTable.reservationCustomer || 'Không rõ'}\n- Thời gian đặt: ${selectedTable.reservationTime || 'Không rõ'}\n\nXác nhận đúng khách đặt đã đến và tiến hành Mở bàn?`;
      if (!window.confirm(confirmMsg)) {
        return;
      }
    }

    if (selectedTable.status === 'reserved' || selectedTable.status === 'empty') {
      try {
        await api.post(`/api/phuc-vu/ban/${selectedTableId}/mo-ban?maNV=${user.maNV || ''}`);
        await fetchTables();
        await fetchTableDetails(selectedTableId);
        showToast(`Đã mở bàn ${selectedTable.name}. Bắt đầu gọi món!`, 'success');
        openOrderModal();
      } catch (e) {
        showToast(e.message || 'Không thể mở bàn', 'error');
      }
    } else {
      openOrderModal();
    }
  };

  // --- MODAL LOGIC ---
  const openOrderModal = () => {
    setModalSelections({});
    setActiveCategory('all');
    setIsModalOpen(true);
  };

  const changeItemQty = (itemId, delta) => {
    setModalSelections(prev => {
      const current = prev[itemId] || { qty: 0, note: '' };
      const updatedQty = Math.max(0, current.qty + delta);
      const newState = { ...prev };

      if (updatedQty === 0) {
        delete newState[itemId];
      } else {
        newState[itemId] = { ...current, qty: updatedQty };
      }
      return newState;
    });
  };

  const changeItemNote = (itemId, note) => {
    setModalSelections(prev => {
      if (!prev[itemId]) return prev;
      return {
        ...prev,
        [itemId]: { ...prev[itemId], note }
      };
    });
  };

  const submitOrder = async () => {
    const selectedKeys = Object.keys(modalSelections);
    if (selectedKeys.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 món ăn!', 'warning');
      return;
    }

    const requestData = {
      danhSachMon: selectedKeys.map(key => ({
        maMon: parseInt(key),
        soLuong: modalSelections[key].qty,
        ghiChu: modalSelections[key].note
      }))
    };

    try {
      // Nếu bàn chưa mở (hoặc k có orderId) thì báo lỗi, nhưng primary action đã lo mở bàn rồi
      if (!selectedTable.orderId) {
        showToast('Bàn chưa được mở!', 'error');
        return;
      }
      await api.post(`/api/phuc-vu/phieu/${selectedTable.orderId}/them-mon`, requestData);
      setIsModalOpen(false);
      fetchTableDetails(selectedTableId);
      showToast('Ghi nhận món thành công! Phiếu đã gửi xuống bếp.', 'success');
    } catch (e) {
      showToast(e.message || 'Lỗi thêm món', 'error');
    }
  };

  const filteredMenuItems = activeCategory === 'all'
    ? menuItems
    : menuItems.filter(m => m.category === activeCategory);

  // --- CẤU HÌNH LAYOUT ---
  const userFullName = user.hoTen || 'Nhân Viên Phục Vụ';
  const userNameInitials = userFullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const topbarProps = {
    title: "Waiter",
    tagText: "Trực tuyến",
    shiftInfo: "CA SÁNG (07:00 - 15:00)",
    userInfo: { name: userFullName, role: "Phục vụ", initials: userNameInitials },
    icon: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  };

  const sidebarProps = {
    branchName: "NEXUSCORE",
    activeTab,
    setActiveTab,
    userInfo: { name: userFullName, role: "Phục Vụ", initials: userNameInitials },
    navItems: [
      {
        id: 'map',
        label: 'Sơ Đồ Bàn',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
      }
    ]
  };

  return (
    <MainLayout topbarProps={topbarProps} sidebarProps={sidebarProps}>
      <div className="absolute inset-0 flex overflow-hidden">

        {/* CỘT TRÁI: TABLE GRID */}
        <section className="flex-1 flex flex-col min-w-0 border-r border-slate-200/80 overflow-hidden bg-slate-50/50" style={{ backgroundImage: 'linear-gradient(to right, rgba(226, 232, 240, 0.45) 1px, transparent 1px), linear-gradient(to bottom, rgba(226, 232, 240, 0.45) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between flex-shrink-0 bg-white/90 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Trạng Thái:</span>
              <div className="flex items-center space-x-4 text-xs font-medium pl-2">
                <span className="inline-flex items-center text-slate-700"><span className="w-3 h-3 rounded-full bg-emerald-500 mr-1.5 border border-emerald-600/30"></span> Bàn Trống ({emptyCount})</span>
                <span className="inline-flex items-center text-slate-700"><span className="w-3 h-3 rounded-full bg-amber-500 mr-1.5 border border-amber-600/30"></span> Đang Phục Vụ ({servingCount})</span>
                <span className="inline-flex items-center text-slate-700"><span className="w-3 h-3 rounded-full bg-rose-500 mr-1.5 border border-rose-600/30"></span> Đã Đặt ({reservedCount})</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tables.map(table => {
                const isSelected = table.id === selectedTableId;

                let statusBadge, borderTopClass;
                if (table.status === 'empty') {
                  statusBadge = <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">Trống</span>;
                  borderTopClass = 'border-t-emerald-500';
                } else if (table.status === 'serving') {
                  statusBadge = <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">Đang phục vụ</span>;
                  borderTopClass = 'border-t-amber-500';
                } else {
                  statusBadge = <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800">Đã đặt trước</span>;
                  borderTopClass = 'border-t-rose-500';
                }

                const activeRing = isSelected ? 'ring-2 ring-blue-600 border-blue-600 shadow-md' : 'border-slate-200 hover:border-slate-300 shadow-sm';

                return (
                  <div key={table.id} onClick={() => handleTableSelect(table.id)} className={`bg-white rounded-lg p-4 cursor-pointer transition-all flex flex-col justify-between border-t-4 border ${borderTopClass} ${activeRing}`}>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-slate-900">{table.name}</span>
                        {statusBadge}
                      </div>
                    </div>
                    <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="font-mono text-slate-700 font-bold">{table.code}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CỘT PHẢI: TABLE DETAIL PANEL */}
        {selectedTable && (
          <>
            {/* Bảng chi tiết bàn: Nổi (absolute) trên màn hình nhỏ, Cố định (static) trên Desktop */}
            <section className="absolute right-0 inset-y-0 z-30 w-full sm:w-96 lg:static lg:w-[420px] bg-white flex flex-col flex-shrink-0 shadow-2xl lg:shadow-lg transition-transform">
              <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-slate-900">{selectedTable.name}</h2>
                  {selectedTable.status === 'reserved' && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300 hidden sm:inline-block">Đã Đặt Trước</span>}
                  {selectedTable.status === 'serving' && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 hidden sm:inline-block">Đang Phục Vụ</span>}
                  {selectedTable.status === 'empty' && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 hidden sm:inline-block">Trống</span>}
                </div>

                {/* Nút đóng bảng chi tiết (Chỉ hiện trên Mobile & Tablet) */}
                <button 
                  onClick={() => handleTableSelect(null)} 
                  className="lg:hidden w-8 h-8 flex items-center justify-center text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors shadow-sm"
                  title="Đóng bảng"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              <div className="px-4 py-2.5 bg-slate-100/60 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <div>Mã Phiếu: <span className="font-mono font-bold text-slate-800">{selectedTable.code || '---'}</span></div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Món Đã Gọi</span>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    Tổng cộng {selectedTable.orders.reduce((sum, o) => sum + o.qty, 0)}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {selectedTable.status === 'empty' && (
                    <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-center p-4 border border-dashed border-slate-200 rounded-lg">
                      <p className="text-xs font-medium text-slate-600">Bàn hiện chưa có món ăn nào.</p>
                    </div>
                  )}
                  {selectedTable.status === 'reserved' && (
                    <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-center p-4 border border-dashed border-slate-200 rounded-lg">
                      <p className="text-xs font-medium text-slate-700">Bàn đã được khách đặt trước.</p>
                      <p className="text-[11px] mt-0.5">Nhấn "Bắt Đầu Phục Vụ" khi khách đã đến.</p>
                    </div>
                  )}
                  {selectedTable.status === 'serving' && selectedTable.orders.length === 0 && (
                    <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-center p-4 border border-dashed border-slate-200 rounded-lg">
                      <p className="text-xs font-medium text-slate-600">Chưa có món nào được gọi.</p>
                    </div>
                  )}

                  {selectedTable.orders.map((item, idx) => {
                    const isEditing = editingItem?.index === idx;

                    return isEditing ? (
                      <div key={idx} className="p-3 rounded-lg border-2 border-blue-400 bg-blue-50 shadow-sm text-xs transition-all">
                        <div className="font-bold text-slate-900 mb-2">{item.name}</div>

                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-medium text-slate-700">Số lượng:</span>
                          <div className="flex items-center space-x-1">
                            <button onClick={() => setEditingItem(prev => ({ ...prev, qty: Math.max(1, prev.qty - 1) }))} className="w-6 h-6 flex items-center justify-center bg-white border border-slate-300 rounded hover:bg-slate-100 font-bold transition-colors">-</button>
                            <span className="w-6 text-center font-bold text-sm text-slate-800">{editingItem.qty}</span>
                            <button onClick={() => setEditingItem(prev => ({ ...prev, qty: prev.qty + 1 }))} className="w-6 h-6 flex items-center justify-center bg-white border border-slate-300 rounded hover:bg-slate-100 font-bold transition-colors">+</button>
                          </div>
                        </div>

                        <div className="mb-3">
                          <input
                            type="text"
                            value={editingItem.note}
                            onChange={(e) => setEditingItem(prev => ({ ...prev, note: e.target.value }))}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
                            placeholder="Nhập yêu cầu riêng (ít đường, không hành...)"
                          />
                        </div>

                        <div className="flex justify-end space-x-2">
                          <button onClick={cancelEditOrderItem} className="px-3 py-1.5 bg-white border border-slate-300 text-slate-600 font-medium rounded hover:bg-slate-50 transition">Hủy</button>
                          <button onClick={saveEditOrderItem} className="px-3 py-1.5 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition shadow-sm">Lưu</button>
                        </div>
                      </div>
                    ) : (
                      <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-white shadow-sm text-xs hover:border-slate-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="font-bold text-slate-900 flex-1 pr-2">{item.name}</div>
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded font-mono font-semibold text-slate-700">x{item.qty}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {item.status === 'Chờ chế biến' && <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-medium text-[10px]">Chờ chế biến</span>}
                            {item.status === 'Đang nấu' && <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-medium text-[10px]">Đang nấu</span>}
                            {item.status === 'Đã xong' && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-medium text-[10px]">Đã xong</span>}
                            {item.note && <span className="text-[11px] text-slate-500 italic truncate max-w-[140px]" title={item.note}>“{item.note}”</span>}
                          </div>

                          {item.status === 'Chờ chế biến' && (
                            <div className="flex items-center space-x-1">
                              <button onClick={() => startEditOrderItem(idx, item)} className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded transition flex items-center gap-1" title="Sửa thông tin món">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                              <button onClick={() => handleRemoveOrderItem(idx)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition flex items-center gap-1" title="Xóa món">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 bg-white space-y-2">
                <button onClick={handlePrimaryAction} className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-sm transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  <span>{selectedTable.status === 'empty' ? '+ Mở Bàn & Gọi Món' : selectedTable.status === 'reserved' ? 'Bắt Đầu Phục Vụ' : 'Thêm Món Vào Bàn'}</span>
                </button>
              </div>
            </section>
          </>
        )}
      </div>

      {/* --- MODAL GỌI MÓN --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                  <span>Thực Đơn Gọi Món</span>
                  <span className="text-xs font-normal text-slate-500">•</span>
                  <span className="text-blue-600 font-semibold text-sm">{selectedTable?.name}</span>
                </h3>
                <p className="text-xs text-slate-500">Chọn món ăn, đồ uống cần thêm và ghi chú riêng</p>
              </div>
            </div>

            <div className="px-5 py-3 border-b border-slate-100 bg-white flex items-center space-x-2 overflow-x-auto overflow-y-hidden text-xs font-medium shrink-0">
              {['all', 'main', 'hotpot', 'appetizer', 'beverage', 'dessert'].map(cat => (
                <button
                  key={cat} onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap flex-shrink-0 px-4 py-2 rounded-full transition leading-none h-8 flex items-center justify-center ${activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {cat === 'all' ? 'Tất Cả' : cat === 'main' ? 'Món Chính' : cat === 'hotpot' ? 'Lẩu & Nướng' : cat === 'appetizer' ? 'Món Khai Vị' : cat === 'beverage' ? 'Thức Uống' : 'Tráng Miệng'}
                </button>
              ))}
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {filteredMenuItems.map(item => {
                const selection = modalSelections[item.id] || { qty: 0, note: '' };
                const qty = selection.qty;
                const note = selection.note;

                return (
                  <div key={item.id} className="flex flex-col p-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 pr-3">
                        <div className="font-bold text-sm text-slate-900">{item.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                        <div className="font-mono text-xs font-semibold text-blue-700 mt-1">{formatCurrency(item.price)}</div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button onClick={() => changeItemQty(item.id, -1)} className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition ${qty === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>-</button>
                        <span className="w-6 text-center font-mono font-bold text-sm text-slate-900">{qty}</span>
                        <button onClick={() => changeItemQty(item.id, 1)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-sm transition">+</button>
                      </div>
                    </div>

                    {qty > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100/80">
                        <input
                          type="text"
                          placeholder="Thêm yêu cầu (VD: ít đường, không hành, độ chín...)"
                          value={note}
                          onChange={(e) => changeItemNote(item.id, e.target.value)}
                          className="w-full bg-slate-50 text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="text-xs text-slate-600">Đang chọn tổng cộng: <span className="font-bold text-blue-600 text-sm">{Object.values(modalSelections).reduce((sum, sel) => sum + sel.qty, 0)}</span></div>
              <div className="flex items-center space-x-2">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition">Hủy Bỏ</button>
                <button onClick={submitOrder} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center space-x-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg><span>Thêm Vào Bàn</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST SYSTEM */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 p-3 rounded-lg shadow-xl border-l-4 text-xs font-semibold flex items-center space-x-2.5 max-w-sm transition-all duration-300 ${toast.type === 'warning' ? 'border-amber-500 bg-white text-amber-950' : toast.type === 'info' ? 'border-blue-500 bg-white text-blue-950' : 'border-emerald-500 bg-white text-emerald-950'}`}>
          <svg className={`w-4 h-4 flex-shrink-0 ${toast.type === 'warning' ? 'text-amber-500' : toast.type === 'info' ? 'text-blue-500' : 'text-emerald-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="flex-1">{toast.message}</span>
        </div>
      )}
    </MainLayout>
  );
}