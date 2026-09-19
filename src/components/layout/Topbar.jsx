import React, { useState, useEffect } from 'react';

export default function Topbar({ title, subtitle, tagText, userInfo, shiftInfo, icon: Icon }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 z-30">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold text-lg">
          {Icon ? <Icon /> : <span className="text-xl">N</span>}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-lg tracking-tight text-slate-900">{title}</span>
            {tagText && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span> {tagText}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <div className="text-right hidden sm:block">
          <div className="text-xs font-bold text-slate-700 font-mono">{currentTime.toLocaleTimeString('vi-VN')}</div>
          <div className="text-xs text-slate-500 font-medium">{shiftInfo}</div>
        </div>
        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
        <div className="flex items-center space-x-3 pl-4 sm:pl-0 sm:border-none border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {userInfo?.initials}
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-slate-900 leading-tight">{userInfo?.name}</div>
            <div className="text-xs text-slate-500 font-medium">{userInfo?.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
}