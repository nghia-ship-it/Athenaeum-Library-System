import React from 'react';
import { BookOpen, MapPin, CalendarClock, ShieldCheck } from 'lucide-react';

export default function Guide() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-white mb-4">Hướng Dẫn Mượn & Nhận Sách</h1>
        <p className="text-text-secondary text-lg">Quy trình đơn giản để tiếp cận kho tàng tri thức của Athenaeum.</p>
      </div>

      <div className="space-y-8">
        <div className="bg-surface border border-[#302A24] rounded-2xl p-8 hover:border-[#4A4036] transition-colors relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary/30"></div>
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
              <span className="text-2xl font-serif font-bold">1</span>
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white mb-2">Đăng ký Thẻ thành viên</h2>
              <p className="text-text-secondary mb-4">Để mượn sách, bạn cần có Thẻ thành viên của thư viện Athenaeum. Quá trình đăng ký hoàn toàn miễn phí.</p>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-primary" /> Vào trang <strong>Đăng ký Thẻ</strong>.</li>
                <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-primary" /> Điền đầy đủ thông tin cá nhân.</li>
                <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-primary" /> Nhận thông báo xác nhận thẻ đã được tạo.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-[#302A24] rounded-2xl p-8 hover:border-[#4A4036] transition-colors relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary/30"></div>
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
              <span className="text-2xl font-serif font-bold">2</span>
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white mb-2">Tra cứu và Đặt sách</h2>
              <p className="text-text-secondary mb-4">Hệ thống cho phép bạn tra cứu và đặt trước những cuốn sách yêu thích để tiết kiệm thời gian.</p>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-center gap-2"><BookOpen size={16} className="text-primary" /> Vào trang <strong>Tra cứu & Danh mục</strong>.</li>
                <li className="flex items-center gap-2"><BookOpen size={16} className="text-primary" /> Nhập email của bạn để xác thực.</li>
                <li className="flex items-center gap-2"><BookOpen size={16} className="text-primary" /> Bấm nút <strong>ĐẶT SÁCH</strong> dưới cuốn sách bạn muốn mượn.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-[#302A24] rounded-2xl p-8 hover:border-[#4A4036] transition-colors relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary/30"></div>
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
              <span className="text-2xl font-serif font-bold">3</span>
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white mb-2">Nhận sách tại Thư viện</h2>
              <p className="text-text-secondary mb-4">Sau khi đặt trước, sách sẽ được giữ cho bạn trong vòng 48 giờ. Hãy đến thư viện để nhận sách.</p>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-center gap-2"><MapPin size={16} className="text-primary" /> Đến quầy thủ thư tại Athenaeum.</li>
                <li className="flex items-center gap-2"><MapPin size={16} className="text-primary" /> Cung cấp Email hoặc Tên đã đăng ký thẻ.</li>
                <li className="flex items-center gap-2"><MapPin size={16} className="text-primary" /> Thủ thư sẽ chuyển trạng thái sang "Đang mượn" và trao sách cho bạn.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-[#302A24] rounded-2xl p-8 hover:border-[#4A4036] transition-colors relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary/30"></div>
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
              <span className="text-2xl font-serif font-bold">4</span>
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white mb-2">Trả sách đúng hạn</h2>
              <p className="text-text-secondary mb-4">Hãy chú ý thời gian mượn để tránh bị phạt và tạo cơ hội cho những độc giả khác.</p>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-center gap-2"><CalendarClock size={16} className="text-primary" /> Thời gian mượn tiêu chuẩn: <strong>14 ngày</strong>.</li>
                <li className="flex items-center gap-2"><CalendarClock size={16} className="text-primary" /> Có thể kiểm tra hạn trả tại phần <strong>Tra cứu</strong>.</li>
                <li className="flex items-center gap-2"><CalendarClock size={16} className="text-primary" /> Phí phạt quá hạn: 5,000đ/ngày.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
