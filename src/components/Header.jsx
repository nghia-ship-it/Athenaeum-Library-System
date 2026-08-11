import React from 'react';
import { Search, Plus, Bell, HelpCircle, Calendar, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const routeTitles = {
  'dashboard': 'Tổng quan',
  'books': 'Danh mục sách',
  'members': 'Thành viên',
  'borrowing': 'Mượn trả',
  'reservations': 'Đặt trước',
  'fines': 'Phạt',
  'reports': 'Báo cáo',
  'branches': 'Chi nhánh',
  'settings': 'Cài đặt'
};

export default function Header() {
  const location = useLocation();
  let title = "Tổng quan";
  
  if (location.pathname !== '/') {
    const path = location.pathname.substring(1);
    title = routeTitles[path] || (path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' '));
  }

  return (
    <header className="h-20 px-8 flex items-center justify-between border-b border-[#302A24] bg-background/80 backdrop-blur-md z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 text-text-secondary hover:text-white rounded-lg hover:bg-surface">
          <Menu size={20} />
        </button>
        <h2 className="text-2xl font-serif text-white">{title}</h2>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-[#302A24] text-xs text-text-secondary ml-4">
          <Calendar size={14} />
          <span>Thứ 5, 30 Thg 7</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input 
            type="text" 
            placeholder="Tìm kiếm sách, thành viên, trang..." 
            className="w-72 bg-surface border border-[#302A24] rounded-xl py-2 pl-9 pr-8 text-sm focus:outline-none focus:border-primary/50 text-white placeholder-text-secondary/70 transition-colors"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-secondary bg-[#302A24] px-1.5 py-0.5 rounded">
            /
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-xl bg-primary text-background flex items-center justify-center hover:bg-primaryHover transition-colors shadow-lg shadow-primary/20">
            <Plus size={18} />
          </button>
          <button className="w-9 h-9 rounded-xl border border-[#302A24] flex items-center justify-center text-text-secondary hover:bg-surface hover:text-white transition-colors">
            <Bell size={18} />
          </button>
          <button className="w-9 h-9 rounded-xl border border-[#302A24] flex items-center justify-center text-text-secondary hover:bg-surface hover:text-white transition-colors">
            <HelpCircle size={18} />
          </button>
          <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary font-bold text-sm flex items-center justify-center border border-primary/30 ml-2 cursor-pointer">
            EV
          </div>
        </div>
      </div>
    </header>
  );
}
