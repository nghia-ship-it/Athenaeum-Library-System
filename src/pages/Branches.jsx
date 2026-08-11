import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Branches() {
  const branches = [
    { name: 'Thư viện Trung tâm', address: '123 Đường Sách, Quận 1, TP.HCM', phone: '028 3812 3456', email: 'central@athenaeum.vn', status: 'Mở cửa', hours: '08:00 - 20:00' },
    { name: 'Chi nhánh Phía Nam', address: '45 Đại lộ Khoa Học, Quận 7, TP.HCM', phone: '028 3812 3457', email: 'south@athenaeum.vn', status: 'Mở cửa', hours: '09:00 - 18:00' },
    { name: 'Phòng đọc Trẻ em', address: 'Khu vui chơi Star, Quận 3, TP.HCM', phone: '028 3812 3458', email: 'kids@athenaeum.vn', status: 'Đóng cửa', hours: '09:00 - 17:00 (T2-T6)' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-serif text-white">Quản lý Chi nhánh</h2>
        <button className="bg-primary text-background px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primaryHover transition-colors">
          + Thêm chi nhánh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {branches.map((branch, idx) => (
          <div key={idx} className="bg-surface border border-[#302A24] rounded-2xl p-6 hover:border-[#4A4036] transition-colors relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${branch.status === 'Mở cửa' ? 'bg-status-active' : 'bg-status-overdue'}`}></div>
            
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-serif text-white font-bold">{branch.name}</h3>
              <span className={`px-2 py-1 text-[10px] rounded font-bold uppercase ${branch.status === 'Mở cửa' ? 'bg-status-active/20 text-status-active border border-status-active/20' : 'bg-status-overdue/20 text-status-overdue border border-status-overdue/20'}`}>
                {branch.status}
              </span>
            </div>

            <div className="space-y-3 text-sm text-text-secondary">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 opacity-70" />
                <span>{branch.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={16} className="opacity-70" />
                <span>{branch.hours}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="opacity-70" />
                <span>{branch.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="opacity-70" />
                <span>{branch.email}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button className="flex-1 bg-[#302A24] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#4A4036] transition-colors">
                Chỉnh sửa
              </button>
              <button className="flex-1 bg-[#302A24] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#4A4036] transition-colors">
                Xem nhân sự
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
