import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MemberRegistration() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // Thêm thành viên vào Firestore
      await addDoc(collection(db, 'members'), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        booksOut: 0,
        fines: 0,
        createdAt: new Date(),
        status: 'Hoạt động'
      });

      setIsSuccess(true);
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error);
      setErrorMsg('Đã xảy ra lỗi khi gửi yêu cầu đăng ký. Vui lòng thử lại sau.');
    }
    
    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center animate-fade-in">
        <div className="w-20 h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-serif font-bold text-white mb-4">Đăng ký thành công!</h2>
        <p className="text-text-secondary mb-8 leading-relaxed">
          Chào mừng <strong>{formData.name}</strong> đã trở thành thành viên của thư viện Athenaeum. <br/>
          Giờ đây bạn có thể sử dụng email <strong>{formData.email}</strong> để tra cứu thông tin sách đang mượn và các khoản phạt tại hệ thống.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/portal" className="bg-primary text-background px-6 py-3 rounded-xl font-bold hover:bg-primaryHover transition-colors">
            Tra cứu ngay
          </Link>
          <button 
            onClick={() => {
              setIsSuccess(false);
              setFormData({ name: '', email: '', phone: '', address: '' });
            }}
            className="border border-[#302A24] text-white px-6 py-3 rounded-xl font-medium hover:bg-surfaceHover transition-colors"
          >
            Đăng ký tài khoản khác
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-serif font-bold text-white mb-3">Đăng ký Thẻ Thành viên</h2>
        <p className="text-text-secondary">Trở thành một phần của thư viện Athenaeum để mượn hàng ngàn cuốn sách hấp dẫn.</p>
      </div>

      <div className="bg-surface border border-[#302A24] rounded-2xl p-8 shadow-xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/5 rounded-tr-full pointer-events-none"></div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <User size={14} /> Họ và tên
              </label>
              <input 
                required 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                placeholder="Nguyễn Văn A"
                className="w-full bg-background border border-[#302A24] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-colors" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Mail size={14} /> Email
              </label>
              <input 
                required 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                placeholder="email@example.com"
                className="w-full bg-background border border-[#302A24] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-colors" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Phone size={14} /> Số điện thoại
              </label>
              <input 
                required 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleInputChange} 
                placeholder="0912345678"
                className="w-full bg-background border border-[#302A24] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-colors" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <MapPin size={14} /> Địa chỉ liên hệ
              </label>
              <input 
                required 
                type="text" 
                name="address" 
                value={formData.address} 
                onChange={handleInputChange} 
                placeholder="Quận 1, TP.HCM"
                className="w-full bg-background border border-[#302A24] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-colors" 
              />
            </div>
          </div>

          <div className="pt-6 border-t border-[#302A24] text-center">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary text-background px-8 py-3 rounded-xl font-bold hover:bg-primaryHover transition-colors disabled:opacity-50 min-w-[200px]"
            >
              {isSubmitting ? 'Đang gửi...' : 'Đăng ký ngay'}
            </button>
            <p className="text-xs text-text-secondary mt-4">
              Bằng việc đăng ký, bạn đồng ý với các nội quy và quy định mượn trả sách của thư viện Athenaeum.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
