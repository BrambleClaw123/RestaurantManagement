import React from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';

export default function MainLayout({ topbarProps, sidebarProps, children }) {
  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden select-none font-sans">
      <Topbar {...topbarProps} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar {...sidebarProps} />
        <main className="flex-1 bg-slate-50 p-6 md:p-8 overflow-y-auto flex flex-col relative">
          {children}
        </main>
      </div>
    </div>
  );
}