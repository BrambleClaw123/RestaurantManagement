import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ brandName, brandSub, branchName, navItems, activeTab, setActiveTab, userInfo, isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      navigate('/login');
    }
  };

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (onClose) onClose(); 
  };

  return (
    <aside 
      className={`
        fixed md:static inset-y-0 left-0 z-40
        /* Kích thước: Mobile w-64, Tablet thu nhỏ thành w-48 (tùy chỉnh tại đây), Desktop về lại w-64 */
        w-64 md:w-48 lg:w-64 
        bg-white border-r border-slate-200 flex flex-col justify-between flex-shrink-0
        transition-all duration-300 ease-in-out
        /* Logic: Mobile (-translate) nếu đóng, Tablet trở lên (md:translate-x-0) luôn luôn hiện */
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      style={{ top: '64px' }} 
    >
      
      <div className="p-4 space-y-6 overflow-y-auto overflow-x-hidden">
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
          <div className="flex items-center space-x-2 truncate pr-2">
            <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            <span className="truncate">{branchName || 'CHI NHÁNH TRUNG TÂM'}</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => handleNavClick(item.id)} 
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${isActive ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'}`}
                title={item.label} /* Hiển thị tooltip khi chữ bị cắt trên Tablet */
              >
                <div className="flex items-center space-x-3 truncate pr-2">
                  <div className={`flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>{item.icon}</div>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`${isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'} px-2 py-0.5 rounded-full text-[11px] font-bold flex-shrink-0`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex-shrink-0 overflow-hidden">
        <div className="flex items-center justify-between group cursor-pointer" onClick={handleLogout} title="Đăng xuất">
          <div className="flex items-center space-x-3 truncate pr-2">
            <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm flex-shrink-0">{userInfo?.initials}</div>
            <div className="truncate">
              <div className="font-bold text-blue-900 text-sm leading-tight truncate">{userInfo?.name}</div>
              <div className="text-xs text-slate-500 font-medium truncate">{userInfo?.role}</div>
            </div>
          </div>
          <svg className="w-5 h-5 text-slate-400 group-hover:text-rose-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
        </div>
      </div>
    </aside>
  );
}