import React from 'react';
import { Search, Plus, Bell, HelpCircle, Calendar, Menu, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  let title = "Tổng quan";
  
  if (location.pathname !== '/') {
    const path = location.pathname.substring(1);
    title = routeTitles[path] || (path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' '));
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  const getInitials = (email) => {
    if (!email) return 'EV';
    return email.substring(0, 2).toUpperCase();
  };



  return (
    <header className="h-20 px-8 flex items-center justify-between border-b border-[#302A24] bg-background/80 backdrop-blur-md z-40 sticky top-0">
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
          {/* Quick Add */}
          <div className="relative group">
            <button className="w-9 h-9 rounded-xl bg-primary text-background flex items-center justify-center hover:bg-primaryHover transition-colors shadow-lg shadow-primary/20" title="Thêm mới">
              <Plus size={18} />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-[#302A24] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
              <div className="px-4 py-2 border-b border-[#302A24]">
                <p className="text-xs font-semibold text-text-secondary uppercase">Thêm nhanh</p>
              </div>
              <button onClick={() => navigate('/admin/books')} className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-surfaceHover hover:text-white transition-colors">Thêm sách</button>
              <button onClick={() => navigate('/admin/members')} className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-surfaceHover hover:text-white transition-colors">Thêm thành viên</button>
              <button onClick={() => navigate('/admin/borrowing')} className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-surfaceHover hover:text-white transition-colors">Thêm lượt mượn</button>
            </div>
          </div>

          {/* Notifications */}
          <div className="relative group">
            <button className="w-9 h-9 rounded-xl border border-[#302A24] flex items-center justify-center text-text-secondary hover:bg-surface hover:text-white transition-colors" title="Thông báo">
              <Bell size={18} />
            </button>
            <div className="absolute right-0 top-full mt-2 w-64 bg-surface border border-[#302A24] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="px-4 py-3 border-b border-[#302A24]">
                <p className="text-sm font-semibold text-white">Thông báo</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-sm text-text-secondary">Bạn không có thông báo mới nào.</p>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="relative group">
            <button className="w-9 h-9 rounded-xl border border-[#302A24] flex items-center justify-center text-text-secondary hover:bg-surface hover:text-white transition-colors" title="Trợ giúp">
              <HelpCircle size={18} />
            </button>
            <div className="absolute right-0 top-full mt-2 w-64 bg-surface border border-[#302A24] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="px-4 py-3 border-b border-[#302A24]">
                <p className="text-sm font-semibold text-white">Trợ giúp & Hỗ trợ</p>
              </div>
              <div className="p-4 text-sm text-text-secondary space-y-2">
                <p>Email: <span className="text-primary">support@athenaeum.com</span></p>
                <p>Hotline: <span className="text-white">1900 1234</span></p>
                <button onClick={() => navigate('/admin/settings')} className="mt-2 text-primary hover:underline">Xem hướng dẫn chi tiết</button>
              </div>
            </div>
          </div>
          <div 
            className="w-9 h-9 rounded-xl bg-primary/20 text-primary font-bold text-sm flex items-center justify-center border border-primary/30 ml-2 cursor-pointer hover:bg-primary/30 transition-colors relative group"
            title="Tài khoản"
          >
            {getInitials(currentUser?.email)}
            {/* Dropdown Logout */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-[#302A24] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-text-primary hover:bg-surfaceHover hover:text-white rounded-xl flex items-center gap-2"
              >
                <LogOut size={16} />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
