import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const colors = [
  'bg-[#C68A48]', 'bg-[#6A9E6B]', 'bg-[#5F85A1]', 'bg-[#C36453]', 
  'bg-[#8B6B9E]', 'bg-[#5FA193]', 'bg-[#ECA75D]', 'bg-[#799E6B]'
];

export default function Members() {
  const [members, setMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'members'), (snapshot) => {
      const memberData = [];
      snapshot.forEach((doc) => {
        memberData.push({ id: doc.id, ...doc.data() });
      });
      setMembers(memberData);
      setLoading(false);
    }, (error) => {
      console.error("Lỗi khi tải dữ liệu thành viên:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredMembers = members.filter(member => {
    const matchSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'Tất cả' || member.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const initials = formData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      await addDoc(collection(db, 'members'), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        initials: initials,
        color: randomColor,
        status: 'Hoạt động',
        booksOut: 0,
        fines: 0,
        createdAt: new Date()
      });

      setFormData({ name: '', email: '', phone: '' });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Lỗi khi thêm thành viên:", error);
      alert("Đã xảy ra lỗi. Vui lòng thử lại.");
    }
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 flex-1">
          <input 
            type="text" 
            placeholder="Tìm tên hoặc email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-1/3 bg-surface border border-[#302A24] rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-primary/50 text-white placeholder-text-secondary/70 transition-colors"
          />
          <div className="flex bg-surface border border-[#302A24] rounded-xl p-1 text-sm">
            <button 
              onClick={() => setStatusFilter('Tất cả')}
              className={`px-4 py-1 rounded-lg transition-colors ${statusFilter === 'Tất cả' ? 'bg-[#302A24] text-white' : 'text-text-secondary hover:text-white'}`}
            >
              Tất cả
            </button>
            <button 
              onClick={() => setStatusFilter('Hoạt động')}
              className={`px-4 py-1 rounded-lg transition-colors ${statusFilter === 'Hoạt động' ? 'bg-[#302A24] text-white' : 'text-text-secondary hover:text-white'}`}
            >
              Hoạt động
            </button>
            <button 
              onClick={() => setStatusFilter('Tạm khóa')}
              className={`px-4 py-1 rounded-lg transition-colors ${statusFilter === 'Tạm khóa' ? 'bg-[#302A24] text-white' : 'text-text-secondary hover:text-white'}`}
            >
              Tạm khóa
            </button>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-background px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primaryHover transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
          Thêm thành viên
        </button>
      </div>

      {loading ? (
        <div className="text-center text-text-secondary py-20">Đang tải dữ liệu...</div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center text-text-secondary py-20 border border-dashed border-[#302A24] rounded-2xl bg-surface">
          <p className="mb-2">Không tìm thấy thành viên nào khớp với bộ lọc.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredMembers.map((member) => (
            <div key={member.id} className="bg-surface border border-[#302A24] rounded-2xl p-6 flex flex-col items-center text-center hover:border-[#4A4036] transition-colors cursor-pointer">
              <div className={`w-14 h-14 rounded-2xl ${member.color || 'bg-[#5F85A1]'} text-white flex items-center justify-center text-xl font-bold mb-4 shadow-lg`}>
                {member.initials}
              </div>
              <h3 className="text-white font-serif font-bold text-lg leading-tight mb-1">{member.name}</h3>
              <p className="text-xs text-text-secondary mb-3">{member.email}</p>
              
              <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded mb-4 ${member.status === 'Hoạt động' ? 'text-status-active' : 'text-status-overdue'}`}>
                {member.status}
              </div>
              
              <div className="flex gap-3 text-xs border-t border-[#302A24] w-full pt-4 justify-center">
                <span className="text-text-secondary"><span className="text-white font-medium">{member.booksOut}</span> sách đang mượn</span>
                <span className="text-text-secondary"><span className={member.fines > 0 ? 'text-status-overdue font-medium' : 'text-white font-medium'}>${member.fines?.toFixed(2)}</span> nợ phạt</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Thêm Thành Viên */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-surface border border-[#302A24] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-serif text-white mb-6">Thêm thành viên mới</h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Họ và Tên</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-background border border-[#302A24] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-background border border-[#302A24] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Số điện thoại</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-background border border-[#302A24] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-primary/50" />
              </div>
              
              <div className="flex gap-3 mt-8 pt-4 border-t border-[#302A24]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-transparent border border-[#302A24] text-white py-2 rounded-lg text-sm font-medium hover:bg-surfaceHover transition-colors">
                  Hủy
                </button>
                <button type="submit" className="flex-1 bg-primary text-background py-2 rounded-lg text-sm font-semibold hover:bg-primaryHover transition-colors">
                  Đăng ký
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
