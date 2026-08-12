import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Book, Search, UserPlus, LogIn, Info, HelpCircle } from 'lucide-react';

export default function MemberLayout() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "text-primary border-b-2 border-primary" : "text-text-secondary hover:text-white";
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans selection:bg-primary/30">
      {/* Texture Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-40 mix-blend-overlay z-0"
        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }}
      ></div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-[#302A24]">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/portal" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded bg-primary text-background flex items-center justify-center font-serif font-bold text-xl group-hover:scale-105 transition-transform">
              <Book size={24} />
            </div>
            <div>
              <h1 className="font-serif text-2xl leading-tight tracking-wide font-bold">ATHENAEUM</h1>
              <p className="text-xs tracking-[0.3em] text-primary uppercase font-semibold">Thư viện công cộng</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-8">
            <Link to="/portal" className={`flex items-center gap-2 pb-1 transition-colors font-medium ${isActive('/portal')}`}>
              <Search size={18} />
              <span>Tra cứu & Danh mục</span>
            </Link>
            <Link to="/register" className={`flex items-center gap-2 pb-1 transition-colors font-medium ${isActive('/register')}`}>
              <UserPlus size={18} />
              <span>Đăng ký Thẻ</span>
            </Link>
            <Link to="/guide" className={`flex items-center gap-2 pb-1 transition-colors font-medium ${isActive('/guide')}`}>
              <HelpCircle size={18} />
              <span>Hướng dẫn</span>
            </Link>
            <Link to="/about" className={`flex items-center gap-2 pb-1 transition-colors font-medium ${isActive('/about')}`}>
              <Info size={18} />
              <span>Giới thiệu</span>
            </Link>
          </nav>

          {/* Admin Login Link */}
          <Link to="/login" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#302A24] text-text-secondary hover:text-primary hover:border-primary transition-all text-sm font-medium">
            <LogIn size={16} />
            <span>Quản trị viên</span>
          </Link>

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#302A24] bg-surface py-8 relative z-10">
        <div className="max-w-6xl mx-auto px-6 text-center text-text-secondary text-sm">
          <p className="font-serif italic mb-2">"A room without books is like a body without a soul."</p>
          <p>&copy; 2026 Athenaeum Library. Tôn vinh tri thức.</p>
        </div>
      </footer>
    </div>
  );
}
