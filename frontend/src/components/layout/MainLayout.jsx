import React, { useState } from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';

export default function MainLayout({ topbarProps, sidebarProps, children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden select-none font-sans">
      <Topbar {...topbarProps} onToggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar 
          {...sidebarProps} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        {/* Đổi lg:hidden thành md:hidden để overlay chỉ hiện trên Mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        <main className="flex-1 bg-slate-50 p-4 md:p-6 lg:p-8 overflow-y-auto flex flex-col relative w-full">
          {children}
        </main>
      </div>
    </div>
  );
}