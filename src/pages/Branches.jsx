import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    status: 'Mở cửa',
    hours: ''
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'branches'), (snapshot) => {
      const branchData = [];
      snapshot.forEach(doc => branchData.push({ id: doc.id, ...doc.data() }));
      setBranches(branchData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '', address: '', phone: '', email: '', status: 'Mở cửa', hours: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (branch) => {
    setEditingId(branch.id);
    setFormData({
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
      status: branch.status,
      hours: branch.hours
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa chi nhánh này?')) {
      try {
        await deleteDoc(doc(db, 'branches', id));
      } catch (error) {
        console.error("Lỗi khi xóa chi nhánh:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'branches', editingId), formData);
      } else {
        await addDoc(collection(db, 'branches'), {
          ...formData,
          createdAt: new Date()
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Lỗi khi lưu chi nhánh:", error);
      alert("Đã xảy ra lỗi.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-serif text-white">Quản lý Chi nhánh</h2>
        <button 
          onClick={openAddModal}
          className="bg-primary text-background px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primaryHover transition-colors"
        >
          + Thêm chi nhánh
        </button>
      </div>

      {loading ? (
        <div className="text-center text-text-secondary py-20">Đang tải dữ liệu...</div>
      ) : branches.length === 0 ? (
        <div className="text-center text-text-secondary py-20 border border-dashed border-[#302A24] rounded-2xl bg-surface">
          Chưa có chi nhánh nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <div key={branch.id} className="bg-surface border border-[#302A24] rounded-2xl p-6 hover:border-[#4A4036] transition-colors relative overflow-hidden flex flex-col">
              <div className={`absolute top-0 left-0 w-1 h-full ${branch.status === 'Mở cửa' ? 'bg-status-active' : 'bg-status-overdue'}`}></div>
              
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-serif text-white font-bold pr-2">{branch.name}</h3>
                <span className={`px-2 py-1 text-[10px] rounded font-bold uppercase whitespace-nowrap ${branch.status === 'Mở cửa' ? 'bg-status-active/20 text-status-active border border-status-active/20' : 'bg-status-overdue/20 text-status-overdue border border-status-overdue/20'}`}>
                  {branch.status}
                </span>
              </div>

              <div className="space-y-3 text-sm text-text-secondary flex-1">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="mt-0.5 opacity-70 shrink-0" />
                  <span>{branch.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={16} className="opacity-70 shrink-0" />
                  <span>{branch.hours}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="opacity-70 shrink-0" />
                  <span>{branch.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={16} className="opacity-70 shrink-0" />
                  <span>{branch.email}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button 
                  onClick={() => openEditModal(branch)}
                  className="flex-1 bg-[#302A24] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#4A4036] transition-colors"
                >
                  Chỉnh sửa
                </button>
                <button 
                  onClick={() => handleDelete(branch.id)}
                  className="flex-1 bg-[#302A24] text-[#C36453] py-2 rounded-lg text-sm font-medium hover:bg-[#4A4036] transition-colors border border-[#C36453]/20 hover:border-[#C36453]/50"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-surface border border-[#302A24] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-serif text-white mb-6">
              {editingId ? 'Chỉnh sửa chi nhánh' : 'Thêm chi nhánh mới'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Tên chi nhánh</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-background border border-[#302A24] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Địa chỉ</label>
                <input required type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-background border border-[#302A24] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-primary/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Số điện thoại</label>
                  <input required type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-background border border-[#302A24] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-background border border-[#302A24] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-primary/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Giờ hoạt động</label>
                  <input required type="text" name="hours" placeholder="VD: 08:00 - 20:00" value={formData.hours} onChange={handleInputChange} className="w-full bg-background border border-[#302A24] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Trạng thái</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-background border border-[#302A24] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-primary/50">
                    <option value="Mở cửa">Mở cửa</option>
                    <option value="Đóng cửa">Đóng cửa</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-8 pt-4 border-t border-[#302A24]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-transparent border border-[#302A24] text-white py-2 rounded-lg text-sm font-medium hover:bg-surfaceHover transition-colors">
                  Hủy
                </button>
                <button type="submit" className="flex-1 bg-primary text-background py-2 rounded-lg text-sm font-semibold hover:bg-primaryHover transition-colors">
                  {editingId ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
