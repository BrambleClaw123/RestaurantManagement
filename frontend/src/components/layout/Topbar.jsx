import React from 'react';

export default function Topbar({ title, subtitle, tagText, userInfo, shiftInfo, icon: Icon, onToggleSidebar }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between flex-shrink-0 z-50">
      <div className="flex items-center space-x-3">
        {/* Đổi lg:hidden thành md:hidden để ẩn nút từ mốc Tablet trở lên */}
        <button 
          onClick={onToggleSidebar} 
          className="p-2 -ml-2 mr-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg md:hidden transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold text-lg hidden sm:flex">
          {Icon ? <Icon /> : <span className="text-xl">N</span>}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-base md:text-lg tracking-tight text-slate-900 truncate">{title}</span>
            {tagText && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span> {tagText}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 font-medium hidden md:block">{subtitle}</p>}
        </div>
      </div>
      
      <div className="flex items-center space-x-4 md:space-x-6">
        {shiftInfo && <div className="text-xs text-slate-500 font-medium hidden md:block">{shiftInfo}</div>}
        <div className="flex items-center space-x-3 pl-2 sm:pl-4 sm:border-l border-slate-200">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
            {userInfo?.initials}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-sm font-bold text-slate-900 leading-tight">{userInfo?.name}</div>
            <div className="text-[11px] md:text-xs text-slate-500 font-medium">{userInfo?.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
}