import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children, title }) {
  return (
    <div className="flex h-screen overflow-hidden text-text-primary bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-[#161311]">
        {/* Slightly darker background for the main area to match the design's depth */}
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-5 pointer-events-none mix-blend-overlay"></div>
          <div className="relative z-10 max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
