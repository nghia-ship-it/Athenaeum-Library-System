import React from 'react';

export default function Settings() {
  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-serif text-white">Cài đặt hệ thống</h2>
        <button className="bg-primary text-background px-6 py-2 rounded-xl text-sm font-semibold hover:bg-primaryHover transition-colors">
          Lưu thay đổi
        </button>
      </div>

      <div className="bg-surface border border-[#302A24] rounded-2xl overflow-hidden mb-6">
        <div className="p-6 border-b border-[#302A24]">
          <h3 className="text-lg font-serif text-white mb-1">Cấu hình chung</h3>
          <p className="text-sm text-text-secondary">Thiết lập các thông số cơ bản cho thư viện.</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-white mb-2">Tên thư viện</label>
              <input type="text" defaultValue="Athenaeum Library" className="w-full bg-background border border-[#302A24] rounded-xl py-2 px-4 text-sm text-white focus:border-primary/50 focus:outline-none" />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-white mb-2">Số ngày mượn tối đa</label>
              <input type="number" defaultValue="14" className="w-full bg-background border border-[#302A24] rounded-xl py-2 px-4 text-sm text-white focus:border-primary/50 focus:outline-none" />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-white mb-2">Phí phạt / ngày (USD)</label>
              <input type="number" defaultValue="0.50" step="0.1" className="w-full bg-background border border-[#302A24] rounded-xl py-2 px-4 text-sm text-white focus:border-primary/50 focus:outline-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-[#302A24] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[#302A24]">
          <h3 className="text-lg font-serif text-white mb-1">Cấu hình Firebase</h3>
          <p className="text-sm text-text-secondary">Kết nối cơ sở dữ liệu để đồng bộ thông tin.</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Project ID</label>
              <input type="text" placeholder="Nhập Project ID..." className="w-full bg-background border border-[#302A24] rounded-xl py-2 px-4 text-sm text-white focus:border-primary/50 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">API Key</label>
              <input type="password" placeholder="Nhập API Key..." className="w-full bg-background border border-[#302A24] rounded-xl py-2 px-4 text-sm text-white focus:border-primary/50 focus:outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
             <div className="w-3 h-3 rounded-full bg-status-overdue"></div>
             <span className="text-sm text-text-secondary">Trạng thái: Chưa kết nối (Sử dụng dữ liệu mẫu)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
