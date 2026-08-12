import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Shield, ShieldAlert, ShieldCheck, UserX, UserCheck } from 'lucide-react';
import { format } from 'date-fns';

export default function Admins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending, active, rejected

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const adminData = [];
      snapshot.forEach(d => {
        const data = d.data();
        if (data.role !== 'superadmin') {
          adminData.push({ id: d.id, ...data });
        }
      });
      // Sort newest first
      adminData.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setAdmins(adminData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    const confirmMsg = newStatus === 'active' 
      ? 'Bạn có chắc chắn muốn cấp quyền cho tài khoản này?'
      : 'Bạn có chắc chắn muốn từ chối/khóa tài khoản này?';

    if (window.confirm(confirmMsg)) {
      try {
        await updateDoc(doc(db, 'users', id), {
          status: newStatus
        });
      } catch (error) {
        console.error("Lỗi cập nhật trạng thái:", error);
        alert("Đã xảy ra lỗi.");
      }
    }
  };

  const filteredAdmins = admins.filter(a => a.status === activeTab);

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-serif text-white">Quản lý Tài khoản Quản trị</h2>
          <p className="text-text-secondary text-sm mt-1">Xét duyệt và quản lý các tài khoản nhân viên thư viện.</p>
        </div>
      </div>

      <div className="flex bg-surface border border-[#302A24] rounded-xl p-1 text-sm mb-6 max-w-fit">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'pending' ? 'bg-[#302A24] text-white' : 'text-text-secondary hover:text-white'}`}
        >
          <ShieldAlert size={14} /> Chờ phê duyệt
          {admins.filter(a => a.status === 'pending').length > 0 && (
            <span className="bg-primary text-background px-1.5 py-0.5 rounded text-[10px] font-bold">
              {admins.filter(a => a.status === 'pending').length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('active')}
          className={`px-4 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'active' ? 'bg-[#302A24] text-white' : 'text-text-secondary hover:text-white'}`}
        >
          <ShieldCheck size={14} /> Đang hoạt động
        </button>
        <button 
          onClick={() => setActiveTab('rejected')}
          className={`px-4 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'rejected' ? 'bg-[#302A24] text-white' : 'text-text-secondary hover:text-white'}`}
        >
          <UserX size={14} /> Bị từ chối/Khóa
        </button>
      </div>

      <div className="bg-surface border border-[#302A24] rounded-2xl overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="text-center text-text-secondary py-20">Đang tải dữ liệu...</div>
        ) : filteredAdmins.length === 0 ? (
          <div className="text-center text-text-secondary py-20">
             <div className="w-12 h-12 rounded-full bg-[#302A24] flex items-center justify-center mx-auto mb-3">
               <Shield size={20} className="text-text-secondary" />
             </div>
             <p className="mb-2">Không có tài khoản nào trong danh sách này.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1A1614] text-text-secondary text-xs uppercase font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Tài khoản (Email)</th>
                <th className="px-6 py-4 font-medium">Quyền hạn</th>
                <th className="px-6 py-4 font-medium">Ngày đăng ký</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#302A24]">
              {filteredAdmins.map(admin => (
                <tr key={admin.id} className="hover:bg-surfaceHover transition-colors">
                  <td className="px-6 py-4 font-medium text-white">
                    {admin.email}
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {admin.role === 'admin' ? 'Quản trị viên' : admin.role}
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {admin.createdAt ? format(admin.createdAt.toDate(), 'dd/MM/yyyy HH:mm') : '---'}
                  </td>
                  <td className="px-6 py-4">
                    {admin.status === 'active' ? (
                      <span className="px-2 py-1 text-[10px] rounded bg-status-active/20 text-status-active font-bold uppercase border border-status-active/20">Hoạt động</span>
                    ) : admin.status === 'pending' ? (
                      <span className="px-2 py-1 text-[10px] rounded bg-primary/20 text-primary font-bold uppercase border border-primary/20">Chờ duyệt</span>
                    ) : (
                      <span className="px-2 py-1 text-[10px] rounded bg-status-overdue/20 text-status-overdue font-bold uppercase border border-status-overdue/20">Bị khóa</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {admin.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleUpdateStatus(admin.id, 'active')} 
                          className="flex items-center gap-1 text-status-active hover:text-[#5ce08c] bg-status-active/10 px-3 py-1.5 rounded transition-colors"
                        >
                          <UserCheck size={14} /> Duyệt
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(admin.id, 'rejected')} 
                          className="flex items-center gap-1 text-status-overdue hover:text-[#ff8080] bg-status-overdue/10 px-3 py-1.5 rounded transition-colors"
                        >
                          <UserX size={14} /> Từ chối
                        </button>
                      </div>
                    )}
                    {admin.status === 'active' && (
                      <button 
                        onClick={() => handleUpdateStatus(admin.id, 'rejected')} 
                        className="text-status-overdue hover:text-[#ff8080] border border-[#302A24] px-3 py-1 rounded transition-colors bg-surface"
                      >
                        Khóa tài khoản
                      </button>
                    )}
                    {admin.status === 'rejected' && (
                      <button 
                        onClick={() => handleUpdateStatus(admin.id, 'active')} 
                        className="text-status-active hover:text-[#5ce08c] border border-[#302A24] px-3 py-1 rounded transition-colors bg-surface"
                      >
                        Mở khóa
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
