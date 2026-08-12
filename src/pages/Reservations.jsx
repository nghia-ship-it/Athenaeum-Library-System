import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [config, setConfig] = useState({ maxLoanDays: 14 });
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  
  // Form State
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');

  useEffect(() => {
    // Listen to reservations
    const unsubRes = onSnapshot(collection(db, 'reservations'), (snapshot) => {
      const resData = [];
      snapshot.forEach(d => resData.push({ id: d.id, ...d.data() }));
      // Sort newest first
      resData.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setReservations(resData);
      setLoading(false);
    });

    // Listen to books
    const unsubBooks = onSnapshot(collection(db, 'books'), (snapshot) => {
      const bookData = [];
      snapshot.forEach(d => bookData.push({ id: d.id, ...d.data() }));
      setBooks(bookData);
    });

    // Listen to members
    const unsubMembers = onSnapshot(collection(db, 'members'), (snapshot) => {
      const memData = [];
      snapshot.forEach(d => memData.push({ id: d.id, ...d.data() }));
      setMembers(memData);
    });

    // Listen to config
    const unsubConfig = onSnapshot(doc(db, 'settings', 'config'), (docSnap) => {
      if (docSnap.exists()) {
        setConfig(docSnap.data());
      }
    });

    return () => {
      unsubRes();
      unsubBooks();
      unsubMembers();
      unsubConfig();
    };
  }, []);

  const handleAddReservation = async (e) => {
    e.preventDefault();
    if (!selectedBookId || !selectedMemberId) return;

    try {
      const book = books.find(b => b.id === selectedBookId);
      const member = members.find(m => m.id === selectedMemberId);

      // Determine status based on book availability
      const status = book.available > 0 ? 'Sẵn sàng' : 'Chờ sách';

      await addDoc(collection(db, 'reservations'), {
        bookId: selectedBookId,
        bookTitle: book.title,
        bookAuthor: book.author,
        bookGenre: book.genre,
        engGenre: book.engGenre,
        memberId: selectedMemberId,
        memberName: member.name,
        memberEmail: member.email,
        status: status,
        createdAt: new Date(),
        expiryDate: status === 'Sẵn sàng' ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) : null // 2 days to pick up if ready
      });

      setSelectedBookId('');
      setSelectedMemberId('');
      setIsModalOpen(false);
    } catch (error) {
      console.error("Lỗi khi tạo đặt trước:", error);
      alert("Lỗi khi tạo đặt trước.");
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Bạn có chắc muốn hủy đơn đặt sách này?')) {
      try {
        await updateDoc(doc(db, 'reservations', id), {
          status: 'Đã hủy'
        });
      } catch (error) {
        console.error("Lỗi khi hủy đặt sách:", error);
      }
    }
  };

  const handleIssue = async (reservation) => {
    try {
      const bookRef = doc(db, 'books', reservation.bookId);
      const book = books.find(b => b.id === reservation.bookId);
      
      if (!book || book.available <= 0) {
        alert("Sách hiện không có sẵn để mượn!");
        return;
      }

      // Tạo transaction mượn
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (config.maxLoanDays || 14));

      await addDoc(collection(db, 'borrowings'), {
        bookId: reservation.bookId,
        bookTitle: reservation.bookTitle,
        memberId: reservation.memberId,
        memberName: reservation.memberName,
        issueDate: new Date(),
        dueDate: dueDate,
        status: 'Đang mượn'
      });

      // Giảm sách available
      await updateDoc(bookRef, { available: book.available - 1 });
      
      // Update Reservation Status thay vì xóa
      await updateDoc(doc(db, 'reservations', reservation.id), {
        status: 'Đã nhận'
      });
      
      alert("Đã chuyển thành giao dịch mượn sách thành công!");
    } catch (error) {
      console.error("Lỗi khi cho mượn từ đặt trước:", error);
      alert("Đã xảy ra lỗi.");
    }
  };

  const filteredReservations = reservations.filter(res => statusFilter === 'Tất cả' || res.status === statusFilter);

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-serif text-white">Sách đặt trước</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-background px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primaryHover transition-colors"
        >
          + Đặt sách mới
        </button>
      </div>

      <div className="flex bg-surface border border-[#302A24] rounded-xl p-1 text-sm mb-6 max-w-fit">
        {['Tất cả', 'Chờ sách', 'Sẵn sàng', 'Đã nhận', 'Đã hủy'].map(filter => (
          <button 
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`px-4 py-1 rounded-lg transition-colors ${statusFilter === filter ? 'bg-[#302A24] text-white' : 'text-text-secondary hover:text-white'}`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="bg-surface border border-[#302A24] rounded-2xl overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="text-center text-text-secondary py-20">Đang tải dữ liệu...</div>
        ) : filteredReservations.length === 0 ? (
          <div className="text-center text-text-secondary py-20">
             <p className="mb-2">Chưa có dữ liệu cho bộ lọc này.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1A1614] text-text-secondary text-xs uppercase font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Sách</th>
                <th className="px-6 py-4 font-medium">Thành viên</th>
                <th className="px-6 py-4 font-medium">Ngày đặt</th>
                <th className="px-6 py-4 font-medium">Hạn nhận sách</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#302A24]">
              {filteredReservations.map(res => {
                const genreColorClass = `bg-genre-${(res.engGenre || 'classic').toLowerCase()}`;
                const isReady = res.status === 'Sẵn sàng';
                
                return (
                  <tr key={res.id} className="hover:bg-surfaceHover transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-8 rounded-sm ${genreColorClass}`}></div>
                        <div>
                          <p className="font-serif font-bold text-white">{res.bookTitle}</p>
                          <p className="text-[10px] text-text-secondary">{res.bookAuthor}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white">{res.memberName}</td>
                    <td className="px-6 py-4 text-text-secondary">
                      {res.createdAt ? format(res.createdAt.toDate(), 'dd/MM/yyyy') : '---'}
                    </td>
                    <td className="px-6 py-4 text-white">
                      {res.expiryDate ? format(res.expiryDate.toDate(), 'dd/MM/yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {isReady ? (
                         <span className="px-2 py-1 text-[10px] rounded bg-primary/20 text-primary font-bold uppercase border border-primary/20">Sẵn sàng</span>
                      ) : res.status === 'Đã nhận' ? (
                         <span className="px-2 py-1 text-[10px] rounded bg-status-active/20 text-status-active font-bold uppercase border border-status-active/20">Đã nhận</span>
                      ) : res.status === 'Đã hủy' ? (
                         <span className="px-2 py-1 text-[10px] rounded bg-status-overdue/20 text-status-overdue font-bold uppercase border border-status-overdue/20">Đã hủy</span>
                      ) : (
                         <span className="px-2 py-1 text-[10px] rounded bg-[#302A24] text-text-secondary font-bold uppercase border border-[#302A24]">Chờ sách</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isReady && (
                        <button onClick={() => handleIssue(res)} className="text-primary hover:text-white mr-3 border border-[#302A24] px-3 py-1 rounded transition-colors bg-surface">Cho mượn</button>
                      )}
                      {(res.status === 'Chờ sách' || res.status === 'Sẵn sàng') && (
                        <button onClick={() => handleCancel(res.id)} className="text-status-overdue hover:text-[#ff8080] border border-[#302A24] px-3 py-1 rounded transition-colors bg-surface">Hủy</button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Thêm Đặt trước */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-surface border border-[#302A24] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-serif text-white mb-6">Tạo phiếu đặt sách</h3>
            <form onSubmit={handleAddReservation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Chọn Sách</label>
                <select 
                  required 
                  value={selectedBookId} 
                  onChange={(e) => setSelectedBookId(e.target.value)} 
                  className="w-full bg-background border border-[#302A24] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-primary/50"
                >
                  <option value="">-- Chọn Sách --</option>
                  {books.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.available > 0 ? `Sẵn có: ${b.available}` : 'Đang cho mượn hết'})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Chọn Thành viên</label>
                <select 
                  required 
                  value={selectedMemberId} 
                  onChange={(e) => setSelectedMemberId(e.target.value)} 
                  className="w-full bg-background border border-[#302A24] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-primary/50"
                >
                  <option value="">-- Chọn Thành viên --</option>
                  {members.filter(m => m.status === 'Hoạt động').map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 mt-8 pt-4 border-t border-[#302A24]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-transparent border border-[#302A24] text-white py-2 rounded-lg text-sm font-medium hover:bg-surfaceHover transition-colors">
                  Hủy
                </button>
                <button type="submit" className="flex-1 bg-primary text-background py-2 rounded-lg text-sm font-semibold hover:bg-primaryHover transition-colors">
                  Tạo đặt trước
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
