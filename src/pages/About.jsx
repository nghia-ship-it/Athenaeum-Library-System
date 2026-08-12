import React from 'react';
import { Link } from 'react-router-dom';
import { Book, Search, UserPlus, HelpCircle, LogIn } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans relative">
      {/* Navigation - Top Left */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8 z-50 flex items-center gap-6">
        <Link to="/portal" className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors font-medium">
          <Search size={18} />
          <span className="text-sm">Tra cứu sách</span>
        </Link>
        <Link to="/register" className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors font-medium">
          <UserPlus size={18} />
          <span className="text-sm">Đăng ký thẻ</span>
        </Link>
        <Link to="/guide" className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors font-medium">
          <HelpCircle size={18} />
          <span className="text-sm">Hướng dẫn</span>
        </Link>
      </div>

      {/* Admin Link - Top Right (Mobile Only) */}
      <div className="absolute top-6 right-6 z-50 flex md:hidden items-center">
        <Link to="/login" className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors font-medium">
          <LogIn size={18} />
        </Link>
      </div>

      {/* Left Panel - Content */}
      <div className="w-full md:w-1/2 flex flex-col justify-center p-8 pt-24 md:p-16 lg:p-24 relative z-10 overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-primary rounded flex items-center justify-center text-background font-serif font-bold text-xl">
              II|\
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg leading-tight tracking-wide text-white">ATHENAEUM</h1>
              <p className="text-[10px] uppercase tracking-widest text-text-secondary">Library System</p>
            </div>
          </div>

          <h2 className="text-4xl font-serif font-bold text-white mb-6 leading-tight">
            Nơi Lưu Giữ<br/>Tri Thức Nhân Loại
          </h2>
          <p className="text-text-secondary mb-8 leading-relaxed">
            Được thành lập với sứ mệnh bảo tồn tri thức và truyền cảm hứng cho các thế hệ tương lai. Chúng tôi không chỉ là một kho sách, mà là một không gian để suy ngẫm, học hỏi và kết nối.
          </p>

          <div className="space-y-6 mb-12">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-surface border border-[#302A24] flex items-center justify-center shrink-0">
                <Book size={18} className="text-primary" />
              </div>
              <div>
                <h4 className="text-white font-serif font-bold mb-1">Kho tàng phong phú</h4>
                <p className="text-sm text-text-secondary">Lưu giữ hàng ngàn cuốn sách từ kinh điển, văn học, khoa học cho đến lịch sử thế giới.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-surface border border-[#302A24] flex items-center justify-center shrink-0">
                <svg className="w-[18px] h-[18px] text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h4 className="text-white font-serif font-bold mb-1">Không gian học thuật</h4>
                <p className="text-sm text-text-secondary">Tạo ra một không gian Dark Academia lý tưởng cho việc học tập, nghiên cứu và sáng tạo.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Link to="/portal" className="flex-1 text-background bg-primary hover:bg-primaryHover focus:ring-4 focus:ring-primary/50 font-medium rounded-lg text-sm px-5 py-3 text-center transition-colors">
              Khám phá sách
            </Link>
            <Link to="/register" className="flex-1 py-3 px-5 rounded-lg border border-[#302A24] bg-surface flex items-center justify-center hover:bg-surfaceHover transition-colors text-sm font-medium text-white">
              Đăng ký thẻ
            </Link>
          </div>

        </div>
      </div>

      {/* Right Panel - Gradient Background */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#EAB159] to-[#C88A31] p-12 lg:p-24 flex-col justify-center items-center text-center">
        
        {/* Admin Login Link - Top Right */}
        <Link to="/login" className="absolute top-8 right-8 z-50 flex items-center gap-2 px-4 py-2 rounded-full border border-[#5E3A18]/30 text-[#5E3A18] hover:bg-black/5 transition-colors font-medium text-sm">
          <LogIn size={16} />
          <span>Dành cho Quản trị viên</span>
        </Link>

        {/* Decorative circle */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
        
        <div className="relative z-10 max-w-md mx-auto flex flex-col items-center">
          <div className="bg-black/10 text-[#543414] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-8 flex items-center gap-2">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            ATHENAEUM
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-[#3E250E] mb-6 leading-tight">
            Khơi nguồn<br/>Cảm hứng
          </h2>
          <p className="text-[#5E3A18] text-lg mb-10">
            Cái tên Athenaeum bắt nguồn từ tiếng Hy Lạp cổ đại, chỉ những không gian tụ họp của học giả, thi sĩ và các nhà tư tưởng vĩ đại.
          </p>
          
          <Link 
            to="/portal"
            className="px-8 py-3 rounded-full border border-[#5E3A18] text-[#3E250E] font-medium hover:bg-black/5 transition-colors"
          >
            Bắt đầu tra cứu sách
          </Link>

          <div className="mt-20">
            <p className="font-serif italic text-[#5E3A18] opacity-80 max-w-sm mx-auto text-sm">
              "Sách là ngọn hải đăng được dựng lên trên biển cả thời gian."<br/>
              — E.P. Whipple
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
