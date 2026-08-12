import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    libraryName: 'Athenaeum Library',
    maxLoanDays: 14,
    finePerDay: 0.5
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'config');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setConfig(docSnap.data());
        } else {
          // Khởi tạo mặc định nếu chưa có
          await setDoc(docRef, config);
        }
      } catch (error) {
        console.error("Lỗi khi tải cài đặt:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: name === 'libraryName' ? value : Number(value)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'config'), config);
      alert('Đã lưu cấu hình thành công!');
    } catch (error) {
      console.error("Lỗi khi lưu cài đặt:", error);
      alert('Lỗi khi lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center text-text-secondary py-20">Đang tải cấu hình...</div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-serif text-white">Cài đặt hệ thống</h2>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-background px-6 py-2 rounded-xl text-sm font-semibold hover:bg-primaryHover transition-colors disabled:opacity-50"
        >
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      <div className="bg-surface border border-[#302A24] rounded-2xl overflow-hidden mb-6">
        <div className="p-6 border-b border-[#302A24]">
          <h3 className="text-lg font-serif text-white mb-1">Cấu hình chung</h3>
          <p className="text-sm text-text-secondary">Thiết lập các thông số cơ bản cho thư viện. Các thông số này sẽ tự động áp dụng cho các giao dịch mới.</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-white mb-2">Tên thư viện</label>
              <input 
                type="text" 
                name="libraryName"
                value={config.libraryName}
                onChange={handleInputChange}
                className="w-full bg-background border border-[#302A24] rounded-xl py-2 px-4 text-sm text-white focus:border-primary/50 focus:outline-none" 
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-white mb-2">Số ngày mượn tối đa</label>
              <input 
                type="number" 
                name="maxLoanDays"
                value={config.maxLoanDays}
                onChange={handleInputChange}
                className="w-full bg-background border border-[#302A24] rounded-xl py-2 px-4 text-sm text-white focus:border-primary/50 focus:outline-none" 
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-white mb-2">Phí phạt / ngày (USD)</label>
              <input 
                type="number" 
                name="finePerDay"
                value={config.finePerDay}
                onChange={handleInputChange}
                step="0.1" 
                className="w-full bg-background border border-[#302A24] rounded-xl py-2 px-4 text-sm text-white focus:border-primary/50 focus:outline-none" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-[#302A24] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[#302A24]">
          <h3 className="text-lg font-serif text-white mb-1">Kết nối Cơ sở dữ liệu</h3>
          <p className="text-sm text-text-secondary">Trạng thái kết nối của hệ thống với Google Firebase.</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-3 h-3 rounded-full bg-status-active shadow-[0_0_8px_rgba(230,179,137,0.8)]"></div>
             <span className="text-sm text-white font-medium">Trạng thái: Đang hoạt động (Connected to Firebase Realtime)</span>
          </div>
          <p className="text-xs text-text-secondary">Mọi thay đổi dữ liệu (Thêm sách, Mượn trả, Đặt trước...) đều được đồng bộ tức thời trên hệ thống.</p>
        </div>
      </div>
    </div>
  );
}
