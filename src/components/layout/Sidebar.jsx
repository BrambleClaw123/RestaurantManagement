import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ brandName, brandSub, branchName, navItems, activeTab, setActiveTab, userInfo }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      navigate('/login');
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between flex-shrink-0 z-20">
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            <span>{branchName || 'CHI NHÁNH TRUNG TÂM'}</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)} 
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${isActive ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={isActive ? 'text-blue-600' : 'text-slate-500'}>{item.icon}</div>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`${isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'} px-2 py-0.5 rounded-full text-[11px] font-bold`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between group cursor-pointer" onClick={handleLogout} title="Đăng xuất">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm">{userInfo?.initials}</div>
            <div>
              <div className="font-bold text-blue-900 text-sm leading-tight">{userInfo?.name}</div>
              <div className="text-xs text-slate-500 font-medium">{userInfo?.role}</div>
            </div>
          </div>
          <svg className="w-5 h-5 text-slate-400 group-hover:text-rose-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
        </div>
      </div>
    </aside>
  );
}