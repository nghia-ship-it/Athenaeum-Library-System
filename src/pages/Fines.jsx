import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';

export default function Fines() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

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

      <div className="bg-surface border border-[#302A24] rounded-2xl overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="text-center text-text-secondary py-20">Đang tải dữ liệu...</div>
        ) : fines.length === 0 ? (
          <div className="text-center text-text-secondary py-20">Chưa có khoản phạt nào.</div>
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
              {fines.map(f => (
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
    </div>
  );
}
