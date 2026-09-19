import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';

// --- MOCK DATA ---
const INITIAL_ORDERS = [
  { 
    id: '204', table: 'Bàn 04', time: '14:20', 
    items: [{ name: 'Bò Wagyu Áp Chảo Sốt Tiêu Đen', qty: 2, note: 'Không hành tây, độ chín Medium (Vừa tới).', urgent: true }]
  },
  { 
    id: '208', table: 'Bàn 12', time: '08:12', 
    items: [{ name: 'Cá Hồi Nướng Sốt Teriyaki', qty: 1, note: 'Ít muối, da nướng giòn rụm.', urgent: false }, { name: 'Salad Hoàng Gia', qty: 1, note: '', urgent: false }]
  },
  { 
    id: '209', table: 'Bàn 07', time: '05:40', 
    items: [{ name: 'Mì Ý Hải Sản Cay (Spaghetti)', qty: 3, note: 'Để riêng sốt cay, kèm phô mai rắc.', urgent: false }]
  },
  { 
    id: '210', table: 'Bàn 09', time: '02:15', 
    items: [{ name: 'Súp Bào Ngư Vi Cá Thượng Hạng', qty: 2, note: 'Nóng hổi, kèm giấm đỏ riêng.', urgent: false }]
  }
];

const INITIAL_MENU = [
  { id: '101', name: 'Bò Wagyu Áp Chảo Sốt Tiêu Đen', category: 'Món Chính', unit: 'Đĩa', isAvailable: true },
  { id: '102', name: 'Cua Tuyết Hấp Gừng Hành', category: 'Hải Sản Tươi', unit: 'Phần', isAvailable: false },
  { id: '103', name: 'Cá Hồi Nướng Sốt Teriyaki', category: 'Món Chính', unit: 'Đĩa', isAvailable: true }
];

export default function Kitchen() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'menu'
  const [toast, setToast] = useState(null);

  // DATA STATES
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [menuItems, setMenuItems] = useState(INITIAL_MENU);
  const [menuSearch, setMenuSearch] = useState('');

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  // --- ORDER ACTIONS ---
  const handleMarkDone = (orderId, tableName) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    showToast(`Đã hoàn thành ${tableName}! Đã báo phục vụ ra món.`);
  };

  const handleRefreshOrders = () => {
    showToast('Đã đồng bộ đơn mới nhất từ máy chủ POS!');
  };

  // --- MENU ACTIONS ---
  const handleToggleDish = (dishId) => {
    setMenuItems(prev => prev.map(dish => {
      if (dish.id === dishId) {
        const newStatus = !dish.isAvailable;
        showToast(newStatus ? 'Đã mở lại món trên hệ thống POS.' : 'Đã báo hết món tới quầy thu ngân.');
        return { ...dish, isAvailable: newStatus };
      }
      return dish;
    }));
  };

  const filteredMenu = menuItems.filter(m => m.name.toLowerCase().includes(menuSearch.toLowerCase()));

  // --- CẤU HÌNH LAYOUT DÙNG CHUNG ---
  const topbarProps = {
    title: "NexusCore Kitchen",
    subtitle: activeTab === 'orders' ? 'Hệ thống hiển thị Order KDS' : 'Quản lý trạng thái thực đơn POS',
    tagText: "POS Trực Tuyến",
    shiftInfo: "CA TRƯA (10:00 - 15:00)",
    userInfo: { name: "Nguyễn Văn A", role: "Trạm trung tâm #HOT-01", initials: "NA" },
    icon: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
  };

  const sidebarProps = {
    branchName: "VỊ TRÍ: BẾP NÓNG #1",
    activeTab,
    setActiveTab,
    userInfo: { name: "Bếp trưởng Minh", role: "Trạm trưởng", initials: "BM" },
    navItems: [
      {
        id: 'orders',
        label: 'Danh Sách Order',
        badge: `${orders.length} chờ`,
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
      },
      {
        id: 'menu',
        label: 'Quản Lý Món Ăn',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
      }
    ]
  };

  return (
    <MainLayout topbarProps={topbarProps} sidebarProps={sidebarProps}>
      
      {/* TAB 1: DANH SÁCH ORDER (KDS) */}
      {activeTab === 'orders' && (
        <div className="space-y-5 animate-in fade-in duration-200 h-full flex flex-col">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hàng Đợi KDS</h1>
            <button onClick={handleRefreshOrders} className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition shadow-sm">
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Đồng bộ POS
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-start">
            {orders.map((order, index) => {
              const isActive = index === 0; // Đơn đầu tiên luôn là Đang nấu
              
              return (
                <article key={order.id} className={`bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col transition-all ${isActive ? 'border-blue-300 ring-1 ring-blue-300' : 'border-slate-200'}`}>
                  <div className={`p-4 border-b flex items-center justify-between ${isActive ? 'bg-blue-50/70 border-blue-100' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-lg font-bold text-slate-900">{order.table}</span>
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold border ${isActive ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>#ORD-{order.id}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${isActive ? 'text-blue-700 bg-blue-100' : 'text-slate-600 bg-slate-100'}`}>
                        {isActive ? 'Đang nấu' : 'Chờ chế biến'}
                      </span>
                      <div className="flex items-center space-x-1 text-slate-500 font-mono font-medium text-[11px]">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{order.time}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 flex-1 space-y-3 bg-white">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-bold text-slate-900 leading-snug pr-2">{item.name}</h4>
                          <span className="text-base font-extrabold font-mono text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-sm">x{item.qty}</span>
                        </div>
                        {item.note && (
                          <div className={`mt-2.5 p-2 border rounded text-xs flex items-start gap-1.5 ${item.urgent ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                            <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${item.urgent ? 'text-rose-600' : (isActive ? 'text-blue-500' : 'text-amber-500')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className={item.urgent ? 'font-medium' : ''}>{item.note}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3.5 bg-slate-50/70 border-t border-slate-100">
                    {isActive ? (
                      <button onClick={() => handleMarkDone(order.id, order.table)} className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-lg shadow-sm flex items-center justify-center space-x-2 transition text-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                        <span>Xong - Ra Món</span>
                      </button>
                    ) : (
                      <div className="w-full py-2 px-3 bg-slate-100 text-slate-500 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 border border-slate-200">
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                        <span>Đang đợi #{index}</span>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}

            {orders.length === 0 && (
              <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                <div className="w-12 h-12 mx-auto mb-3 text-emerald-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <p className="text-base font-bold text-slate-800">Không có order nào đang chờ</p>
                <p className="text-xs text-slate-500 mt-1">Bếp đã hoàn thành tất cả các món.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: QUẢN LÝ TRẠNG THÁI MÓN ĂN */}
      {activeTab === 'menu' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Trạng Thái Thực Đơn Hôm Nay</h1>
              <p className="text-sm text-slate-500 mt-1">Gạt công tắc để tắt món khi hết nguyên liệu. Dữ liệu sẽ đồng bộ tức thì lên hệ thống POS lễ tân.</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input value={menuSearch} onChange={(e) => setMenuSearch(e.target.value)} className="bg-slate-50 border border-slate-200 text-sm rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white w-full sm:w-72 outline-none transition-all" placeholder="Tìm kiếm món nhanh..." type="text" />
                <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-100 text-xs uppercase text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Tên Món</th>
                  <th className="px-6 py-4">Loại Món</th>
                  <th className="px-6 py-4 text-center">Đơn Vị Tính</th>
                  <th className="px-6 py-4 text-right">Trạng Thái (POS)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMenu.map(dish => (
                  <tr key={dish.id} className={`hover:bg-slate-50/60 transition ${!dish.isAvailable ? 'bg-rose-50/20' : ''}`}>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{dish.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200">{dish.category}</span>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">{dish.unit}</td>
                    <td className="px-6 py-4 text-right">
                      <label className="inline-flex items-center cursor-pointer select-none">
                        <input type="checkbox" className="sr-only peer" checked={dish.isAvailable} onChange={() => handleToggleDish(dish.id)} />
                        <div className="relative w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        <span className={`ms-3 text-sm font-bold min-w-[70px] text-left ${dish.isAvailable ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {dish.isAvailable ? 'Còn món' : 'Hết món'}
                        </span>
                      </label>
                    </td>
                  </tr>
                ))}
                {filteredMenu.length === 0 && (
                  <tr><td colSpan="4" className="py-8 text-center text-slate-400 font-medium">Không tìm thấy món ăn phù hợp.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TOAST SYSTEM */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}
    </MainLayout>
  );
}