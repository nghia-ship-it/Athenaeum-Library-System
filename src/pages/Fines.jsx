import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, getDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';

export default function Fines() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    // Fetch members for dropdown
    const unsubMembers = onSnapshot(collection(db, 'members'), (snapshot) => {
      const mData = [];
      snapshot.forEach(doc => mData.push({ id: doc.id, ...doc.data() }));
      setMembers(mData);
    });
    return () => unsubMembers();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'fines'), (snapshot) => {
      const fData = [];
      snapshot.forEach(doc => fData.push({ id: doc.id, ...doc.data() }));
      // Sắp xếp mới nhất lên đầu
      fData.sort((a, b) => b.createdAt - a.createdAt);
      setFines(fData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'dd MMM');
  };

  const handlePayFine = async (fine) => {
    try {
      const fineRef = doc(db, 'fines', fine.id);
      const memberRef = doc(db, 'members', fine.memberId);

      // Cập nhật trạng thái Fine
      await updateDoc(fineRef, {
        status: 'Đã thanh toán',
        paidAt: new Date()
      });

      // Trừ nợ trong Member
      const memberSnap = await getDoc(memberRef);
      if (memberSnap.exists()) {
        const memData = memberSnap.data();
        await updateDoc(memberRef, {
          fines: Math.max((memData.fines || 0) - fine.amount, 0)
        });
      }

      alert("Thu tiền thành công!");
    } catch (error) {
      console.error("Lỗi khi thu tiền phạt:", error);
      alert("Đã xảy ra lỗi.");
    }
  };

  const totalUnpaid = fines.filter(f => f.status === 'Chưa thanh toán').reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = fines.filter(f => f.status === 'Đã thanh toán').reduce((sum, f) => sum + f.amount, 0);

  const filteredFines = fines.filter(f => statusFilter === 'Tất cả' || f.status === statusFilter);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-surface border border-[#302A24] rounded-2xl p-4 flex items-center gap-4">
           <div>
             <p className="text-2xl font-serif text-[#C36453] leading-tight">${totalUnpaid.toFixed(2)}</p>
             <p className="text-sm text-text-secondary">Tổng nợ chưa thu</p>
           </div>
        </div>
        <div className="bg-surface border border-[#302A24] rounded-2xl p-4 flex items-center gap-4">
           <div>
             <p className="text-2xl font-serif text-white leading-tight">${totalPaid.toFixed(2)}</p>
             <p className="text-sm text-text-secondary">Tổng đã thu</p>
           </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex bg-surface border border-[#302A24] rounded-xl p-1 text-sm max-w-fit">
          {['Tất cả', 'Chưa thanh toán', 'Đã thanh toán'].map(filter => (
            <button 
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-1 rounded-lg transition-colors ${statusFilter === filter ? 'bg-[#302A24] text-white' : 'text-text-secondary hover:text-white'}`}
            >
              {filter}
            </button>
          ))}
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-background px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primaryHover transition-colors"
        >
          + Thêm phạt
        </button>
      </div>

      <div className="bg-surface border border-[#302A24] rounded-2xl overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="text-center text-text-secondary py-20">Đang tải dữ liệu...</div>
        ) : filteredFines.length === 0 ? (
          <div className="text-center text-text-secondary py-20">Chưa có dữ liệu cho bộ lọc này.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1A1614] text-text-secondary text-xs uppercase font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Thành viên</th>
                <th className="px-6 py-4 font-medium">Lý do</th>
                <th className="px-6 py-4 font-medium">Ngày lập</th>
                <th className="px-6 py-4 font-medium">Số tiền</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#302A24]">
              {filteredFines.map(f => (
                <tr key={f.id} className={`hover:bg-surfaceHover transition-colors ${f.status === 'Đã thanh toán' ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4 text-white font-medium">{f.memberName}</td>
                  <td className="px-6 py-4 text-text-secondary">{f.reason}</td>
                  <td className="px-6 py-4 text-text-secondary">{formatDate(f.createdAt)}</td>
                  <td className={`px-6 py-4 font-bold ${f.status === 'Chưa thanh toán' ? 'text-white' : 'text-text-secondary'}`}>
                    ${f.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {f.status === 'Chưa thanh toán' ? (
                      <span className="px-2 py-1 text-[10px] rounded bg-status-overdue/20 text-status-overdue font-bold uppercase border border-status-overdue/20">Chưa thanh toán</span>
                    ) : (
                      <span className="px-2 py-1 text-[10px] rounded bg-status-active/20 text-status-active font-bold uppercase border border-status-active/20">Đã thanh toán</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {f.status === 'Chưa thanh toán' && (
                      <button 
                        onClick={() => handlePayFine(f)}
                        className="text-primary hover:text-white mr-3 font-medium border border-[#302A24] px-3 py-1 rounded bg-surface transition-colors"
                      >
                        Thu tiền
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <AddFineModal 
          onClose={() => setIsModalOpen(false)}
          members={members}
        />
      )}
    </div>
  );
}

function AddFineModal({ onClose, members }) {
  const [memberId, setMemberId] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!memberId || !amount || !reason) return;
    
    setLoading(true);
    try {
      const member = members.find(m => m.id === memberId);
      await addDoc(collection(db, 'fines'), {
        memberId,
        memberName: member?.name || 'Unknown',
        amount: parseFloat(amount),
        reason,
        status: 'Chưa thanh toán',
        createdAt: new Date()
      });

      // Update member's total fines
      const memberRef = doc(db, 'members', memberId);
      const memberSnap = await getDoc(memberRef);
      if (memberSnap.exists()) {
        const currentFines = memberSnap.data().fines || 0;
        await updateDoc(memberRef, {
          fines: currentFines + parseFloat(amount)
        });
      }

      onClose();
    } catch (error) {
      console.error("Lỗi khi thêm phạt:", error);
      alert("Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-[#302A24] rounded-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-[#302A24] flex justify-between items-center">
          <h3 className="text-xl font-serif text-white">Tạo khoản phạt</h3>
          <button onClick={onClose} className="text-text-secondary hover:text-white">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Thành viên</label>
            <select 
              required
              value={memberId}
              onChange={e => setMemberId(e.target.value)}
              className="w-full bg-[#1A1614] border border-[#302A24] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            >
              <option value="">Chọn thành viên</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name} - {m.email}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Số tiền phạt ($)</label>
            <input 
              required
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-[#1A1614] border border-[#302A24] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Lý do</label>
            <input 
              required
              type="text"
              placeholder="VD: Làm hỏng sách"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full bg-[#1A1614] border border-[#302A24] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[#302A24]">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-text-secondary hover:text-white transition-colors">Hủy</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-primary text-background text-sm font-semibold rounded-lg hover:bg-primaryHover transition-colors disabled:opacity-50">
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
