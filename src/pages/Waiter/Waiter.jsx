import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';

// --- MOCK DATA ---
const INITIAL_TABLES = [
  { id: 'T01', name: 'Bàn 01', code: '#TB-01', status: 'empty', orderId: null, orders: [] },
  { id: 'T02', name: 'Bàn 02', code: '#RES-102', status: 'reserved', orderId: '#RES-102', orders: [] },
  { id: 'T03', name: 'Bàn 03', code: '#ORD-201', status: 'serving', orderId: '#ORD-201', orders: [
      { name: 'Cá Hồi Nướng Sốt Teriyaki', qty: 1, status: 'Đã xong', note: 'Ít muối, da giòn' },
      { name: 'Nước Ép Dưa Hấu', qty: 2, status: 'Chờ chế biến', note: 'Ít đường' }
  ]},
  { id: 'T04', name: 'Bàn 04', code: '#ORD-204', status: 'serving', orderId: '#ORD-204', orders: [
      { name: 'Bò Wagyu Áp Chảo Sốt Tiêu Đen', qty: 2, status: 'Đang làm', note: 'Không hành tây, độ chín Medium' },
      { name: 'Mì Ý Hải Sản Cay (Spaghetti)', qty: 1, status: 'Chờ chế biến', note: 'Để riêng sốt cay, phô mai rắc' },
      { name: 'Nước Cam Ép Nguyên Chất', qty: 2, status: 'Đã xong', note: 'Đá riêng' }
  ]},
  { id: 'T05', name: 'Bàn 05', code: '#TB-05', status: 'empty', orderId: null, orders: [] },
  { id: 'T06', name: 'Bàn 06', code: '#TB-06', status: 'empty', orderId: null, orders: [] },
  { id: 'T07', name: 'Bàn 07', code: '#ORD-209', status: 'serving', orderId: '#ORD-209', orders: [
      { name: 'Bò Wagyu Áp Chảo Sốt Tiêu Đen', qty: 2, status: 'Đang làm', note: 'Không hành tây, độ chín Medium' }
  ]},
  { id: 'T08', name: 'Bàn 08', code: '#RES-108', status: 'reserved', orderId: '#RES-108', orders: [] },
  { id: 'T09', name: 'Bàn 09', code: '#ORD-210', status: 'serving', orderId: '#ORD-210', orders: [
      { name: 'Súp Bào Ngư Vi Cá Thượng Hạng', qty: 2, status: 'Đang làm', note: 'Nóng hổi, kèm giấm đỏ riêng' }
  ]},
  { id: 'T10', name: 'Bàn 10', code: '#TB-10', status: 'empty', orderId: null, orders: [] },
  { id: 'T11', name: 'Bàn 11', code: '#TB-11', status: 'empty', orderId: null, orders: [] },
  { id: 'T12', name: 'Bàn 12', code: '#ORD-208', status: 'serving', orderId: '#ORD-208', orders: [] }
];

const MENU_ITEMS = [
  { id: 'm1', name: 'Bò Wagyu Áp Chảo Sốt Tiêu Đen', category: 'main', price: 450000, desc: 'Thịt bò Wagyu vân mỡ chuẩn A4' },
  { id: 'm2', name: 'Mì Ý Hải Sản Cay (Spaghetti)', category: 'main', price: 180000, desc: 'Mực, tôm tươi sốt marinara' },
  { id: 'm3', name: 'Cá Hồi Nướng Sốt Teriyaki', category: 'main', price: 240000, desc: 'Cá hồi Na Uy phi lê áp chảo' },
  { id: 'm4', name: 'Súp Bào Ngư Vi Cá Thượng Hạng', category: 'appetizer', price: 260000, desc: 'Hầm sâm quý, bổ dưỡng' },
  { id: 'm5', name: 'Salad Hoàng Gia Sốt Caesar', category: 'appetizer', price: 80000, desc: 'Rau xà lách romain' },
  { id: 'm6', name: 'Nước Ép Cam Tươi Nguyên Chất', category: 'beverage', price: 45000, desc: 'Cam sành tươi vắt' },
  { id: 'm7', name: 'Trà Đào Cam Sả Tươi Mát', category: 'beverage', price: 40000, desc: 'Trà đen ủ lạnh với sả' },
  { id: 'm8', name: 'Bánh Mousse Chocolate Bỉ', category: 'dessert', price: 65000, desc: 'Chocolate Bỉ 70% ngọt dịu' }
];

export default function Waiter() {
  // GLOBAL STATES
  const [activeTab, setActiveTab] = useState('map'); // Có 1 tab duy nhất nên gán cứng 'map'
  const [toast, setToast] = useState(null);

  // TABLE STATES
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [selectedTableId, setSelectedTableId] = useState('T02');
  
  // MODAL STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [modalSelections, setModalSelections] = useState({});

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

  const handleRemoveOrderItem = (itemIndex) => {
    const item = selectedTable.orders[itemIndex];
    if (item.status !== 'Chờ chế biến') {
      showToast('Chỉ có thể xóa món đang ở trạng thái "Chờ chế biến"!', 'warning');
      return;
    }
    
    setTables(prev => prev.map(t => {
      if (t.id === selectedTableId) {
        const newOrders = [...t.orders];
        newOrders.splice(itemIndex, 1);
        return { ...t, orders: newOrders };
      }
      return t;
    }));
    showToast(`Đã xóa món "${item.name}" khỏi bàn!`, 'info');
  };

  const handlePrimaryAction = () => {
    if (selectedTable.status === 'reserved') {
      const newCode = '#ORD-' + Math.floor(200 + Math.random() * 90);
      setTables(prev => prev.map(t => 
        t.id === selectedTableId ? { ...t, status: 'serving', code: newCode, orderId: newCode } : t
      ));
      showToast(`Đã nhận khách cho ${selectedTable.name}. Bắt đầu gọi món!`, 'success');
      openOrderModal();
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
      const current = prev[itemId] || 0;
      const updated = Math.max(0, current + delta);
      const newState = { ...prev };
      if (updated === 0) delete newState[itemId];
      else newState[itemId] = updated;
      return newState;
    });
  };

  const submitOrder = () => {
    const selectedKeys = Object.keys(modalSelections);
    if (selectedKeys.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 món ăn!', 'warning');
      return;
    }

    setTables(prev => prev.map(t => {
      if (t.id === selectedTableId) {
        let newStatus = t.status;
        let newCode = t.code;
        if (t.status !== 'serving') {
          newStatus = 'serving';
          newCode = '#ORD-' + Math.floor(200 + Math.random() * 90);
        }

        const currentOrders = [...t.orders];
        selectedKeys.forEach(itemId => {
          const itemInfo = MENU_ITEMS.find(m => m.id === itemId);
          const qty = modalSelections[itemId];
          const existing = currentOrders.find(o => o.name === itemInfo.name && o.status === 'Chờ chế biến');
          
          if (existing) existing.qty += qty;
          else {
            currentOrders.push({
              name: itemInfo.name, qty: qty, status: 'Chờ chế biến', note: 'Order tại bàn qua Waiter POS'
            });
          }
        });
        return { ...t, status: newStatus, code: newCode, orderId: newCode, orders: currentOrders };
      }
      return t;
    }));

    setIsModalOpen(false);
    showToast('Ghi nhận món thành công! Phiếu đã gửi xuống bếp.', 'success');
  };

  const filteredMenuItems = activeCategory === 'all' 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(m => m.category === activeCategory);

  // --- CẤU HÌNH LAYOUT ---
  const topbarProps = {
    title: "NexusCore Waiter",
    subtitle: "Sơ Đồ Bàn & Phục Vụ",
    tagText: "POS Trực tuyến",
    shiftInfo: "CA SÁNG (07:00 - 15:00)",
    userInfo: { name: "Trần Văn B", role: "Phục vụ", initials: "TB" },
    icon: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  };

  const sidebarProps = {
    branchName: "NEXUSCORE",
    activeTab,
    setActiveTab,
    userInfo: { name: "Phục Vụ Ca #1", role: "Trần Văn B", initials: "PV" },
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
      
      {/* 
        MẸO: Dùng absolute inset-0 để vô hiệu hóa padding p-6 của MainLayout 
        giúp giao diện 2 cột của Waiter lấp đầy toàn bộ màn hình 
      */}
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
            <button className="text-xs text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-2.5 py-1.5 rounded-md flex items-center space-x-1 font-medium shadow-sm transition-colors">
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              <span>Làm mới sơ đồ</span>
            </button>
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
                  <div key={table.id} onClick={() => setSelectedTableId(table.id)} className={`bg-white rounded-lg p-4 cursor-pointer transition-all flex flex-col justify-between border-t-4 border ${borderTopClass} ${activeRing}`}>
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
          <section className="w-96 lg:w-[420px] bg-white flex flex-col flex-shrink-0 shadow-lg z-10">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">{selectedTable.name}</h2>
                {selectedTable.status === 'reserved' && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">Đã Đặt Trước</span>}
                {selectedTable.status === 'serving' && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">Đang Phục Vụ</span>}
                {selectedTable.status === 'empty' && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">Trống</span>}
              </div>
            </div>
            
            <div className="px-4 py-2.5 bg-slate-100/60 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div>Mã Phiếu: <span className="font-mono font-bold text-slate-800">{selectedTable.code}</span></div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Món Đã Gọi</span>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {selectedTable.orders.reduce((sum, o) => sum + o.qty, 0)} món
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

                {selectedTable.orders.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-white shadow-sm text-xs">
                    <div className="flex items-start justify-between">
                      <div className="font-bold text-slate-900 flex-1 pr-2">{item.name}</div>
                      <span className="px-1.5 py-0.5 bg-slate-100 rounded font-mono font-semibold text-slate-700">x{item.qty}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {item.status === 'Chờ chế biến' && <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-medium text-[10px]">Chờ chế biến</span>}
                        {item.status === 'Đang làm' && <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-medium text-[10px]">Đang làm</span>}
                        {item.status === 'Đã xong' && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-medium text-[10px]">Đã xong</span>}
                        {item.note && <span className="text-[11px] text-slate-400 italic truncate max-w-[140px]">“{item.note}”</span>}
                      </div>
                      {item.status === 'Chờ chế biến' && (
                        <button onClick={() => handleRemoveOrderItem(idx)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          <span className="text-[11px] font-medium hidden sm:inline">Xóa</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-white space-y-2">
              <button onClick={handlePrimaryAction} className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-sm transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                <span>{selectedTable.status === 'empty' ? '+ Mở Bàn & Gọi Món' : selectedTable.status === 'reserved' ? '+ Bắt Đầu Phục Vụ' : '+ Thêm Món Vào Bàn'}</span>
              </button>
              {selectedTable.status === 'serving' && selectedTable.orders.length > 0 && (
                <button onClick={() => showToast(`Đã gửi tín hiệu GIỤC BẾP cho ${selectedTable.name}!`, 'info')} className="w-full py-2 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center space-x-1.5 transition">
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  <span>Giục Bếp</span>
                </button>
              )}
            </div>
          </section>
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
                <p className="text-xs text-slate-500">Chọn món ăn, đồ uống cần thêm và chỉnh số lượng</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="px-5 py-2 border-b border-slate-100 bg-white flex space-x-2 overflow-x-auto text-xs font-medium">
              {['all', 'main', 'appetizer', 'beverage', 'dessert'].map(cat => (
                <button 
                  key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full transition ${activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {cat === 'all' ? 'Tất Cả' : cat === 'main' ? 'Món Chính' : cat === 'appetizer' ? 'Khai Vị' : cat === 'beverage' ? 'Đồ Uống' : 'Tráng Miệng'}
                </button>
              ))}
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {filteredMenuItems.map(item => {
                const qty = modalSelections[item.id] || 0;
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition">
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
                );
              })}
            </div>

            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="text-xs text-slate-600">Đang chọn: <span className="font-bold text-blue-600 text-sm">{Object.values(modalSelections).reduce((a, b) => a + b, 0)}</span> món mới</div>
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