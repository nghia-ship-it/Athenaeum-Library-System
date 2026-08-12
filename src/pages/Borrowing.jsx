import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';

export default function Borrowing() {
  const [borrowings, setBorrowings] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({ maxLoanDays: 14, finePerDay: 0.5 });

  // Filters
  const [statusFilter, setStatusFilter] = useState('Tất cả');

  // Form State
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [dueDateStr, setDueDateStr] = useState('');

  useEffect(() => {
    // Tải Borrowings
    const unsubBorrowings = onSnapshot(collection(db, 'borrowings'), (snapshot) => {
      const bData = [];
      snapshot.forEach(doc => bData.push({ id: doc.id, ...doc.data() }));
      // Sort by issueDate descending
      bData.sort((a, b) => b.issueDate - a.issueDate);
      setBorrowings(bData);
      setLoading(false);
    });

    // Tải Books (chỉ lấy sách có sẵn)
    const unsubBooks = onSnapshot(collection(db, 'books'), (snapshot) => {
      const bookData = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.available > 0) {
          bookData.push({ id: doc.id, ...data });
        }
      });
      setBooks(bookData);
    });

    // Tải Members (chỉ lấy thành viên đang hoạt động)
    const unsubMembers = onSnapshot(collection(db, 'members'), (snapshot) => {
      const memData = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'Hoạt động') {
          memData.push({ id: doc.id, ...data });
        }
      });
      setMembers(memData);
    });

    // Tải Config
    const unsubConfig = onSnapshot(doc(db, 'settings', 'config'), (docSnap) => {
      if (docSnap.exists()) {
        setConfig(docSnap.data());
      }
    });

    return () => {
      unsubBorrowings();
      unsubBooks();
      unsubMembers();
      unsubConfig();
    };
  }, []);

  // Format date utility
  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    // Handle both Firestore Timestamp and JS Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'dd MMM');
  };

  const handleReturnBook = async (borrowing) => {
    try {
      const bRef = doc(db, 'borrowings', borrowing.id);
      const bookRef = doc(db, 'books', borrowing.bookId);
      const memberRef = doc(db, 'members', borrowing.memberId);

      const [bookSnap, memberSnap] = await Promise.all([
        getDoc(bookRef), getDoc(memberRef)
      ]);

      // Tính toán quá hạn
      const today = new Date();
      const dueDate = borrowing.dueDate.toDate ? borrowing.dueDate.toDate() : new Date(borrowing.dueDate);
      
      let newFine = 0;
      if (today > dueDate) {
        // Tính tiền phạt dựa trên config.finePerDay
        const diffTime = Math.abs(today - dueDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        newFine = diffDays * config.finePerDay;

        // Tạo biên bản phạt
        await addDoc(collection(db, 'fines'), {
          memberId: borrowing.memberId,
          memberName: borrowing.memberName,
          borrowingId: borrowing.id,
          reason: `Quá hạn: ${borrowing.bookTitle} (${diffDays} ngày)`,
          amount: newFine,
          createdAt: today,
          status: 'Chưa thanh toán'
        });
      }

      // Cập nhật Borrowing
      await updateDoc(bRef, {
        status: 'Đã trả',
        returnDate: today
      });

      // Cập nhật Book
      if (bookSnap.exists()) {
        await updateDoc(bookRef, {
          available: (bookSnap.data().available || 0) + 1
        });
      }

      // Cập nhật Member
      if (memberSnap.exists()) {
        const memData = memberSnap.data();
        await updateDoc(memberRef, {
          booksOut: Math.max((memData.booksOut || 0) - 1, 0),
          fines: (memData.fines || 0) + newFine
        });
      }

      alert(newFine > 0 ? `Đã nhận trả sách. Thành viên bị phạt quá hạn: $${newFine.toFixed(2)}` : 'Nhận trả sách thành công!');

    } catch (error) {
      console.error("Lỗi khi nhận trả sách:", error);
      alert("Đã xảy ra lỗi.");
    }
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    if (!selectedBookId || !selectedMemberId || !dueDateStr) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
      // 1. Fetch current book & member to double check and get names
      const bookRef = doc(db, 'books', selectedBookId);
      const memberRef = doc(db, 'members', selectedMemberId);
      
      const [bookSnap, memberSnap] = await Promise.all([
        getDoc(bookRef), getDoc(memberRef)
      ]);

      if (!bookSnap.exists() || !memberSnap.exists()) {
        alert("Dữ liệu sách hoặc thành viên không tồn tại.");
        return;
      }

      const bookData = bookSnap.data();
      const memberData = memberSnap.data();

      if (bookData.available <= 0) {
        alert("Sách này hiện đã hết bản có sẵn.");
        return;
      }

      // 2. Create borrowing record
      const issueDate = new Date();
      const dueDate = new Date(dueDateStr);

      await addDoc(collection(db, 'borrowings'), {
        bookId: selectedBookId,
        bookTitle: bookData.title,
        bookAuthor: bookData.author,
        bookGenre: bookData.engGenre || 'classic',
        memberId: selectedMemberId,
        memberName: memberData.name,
        issueDate: issueDate,
        dueDate: dueDate,
        status: 'Đang mượn'
      });

      // 3. Update Book available count
      await updateDoc(bookRef, {
        available: bookData.available - 1
      });

      // 4. Update Member booksOut count
      await updateDoc(memberRef, {
        booksOut: (memberData.booksOut || 0) + 1
      });

      // Cleanup
      setSelectedBookId('');
      setSelectedMemberId('');
      setDueDateStr('');
      setIsModalOpen(false);

    } catch (error) {
      console.error("Lỗi khi cho mượn sách:", error);
      alert("Đã xảy ra lỗi.");
    }
  };

  const activeLoans = borrowings.filter(b => b.status === 'Đang mượn').length;
  const overdueLoans = borrowings.filter(b => b.status === 'Quá hạn').length;
  const returnedLoans = borrowings.filter(b => b.status === 'Đã trả').length;

  const filteredBorrowings = borrowings.filter(b => statusFilter === 'Tất cả' || b.status === statusFilter);

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-surface border border-[#302A24] rounded-2xl p-4 flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
           </div>
           <div>
             <p className="text-2xl font-serif text-white leading-tight">{activeLoans}</p>
             <p className="text-sm text-text-secondary">Đang mượn</p>
           </div>
        </div>
        <div className="bg-surface border border-[#302A24] rounded-2xl p-4 flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-status-overdue/20 text-status-overdue flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
           </div>
           <div>
             <p className="text-2xl font-serif text-white leading-tight">{overdueLoans}</p>
             <p className="text-sm text-text-secondary">Quá hạn</p>
           </div>
        </div>
        <div className="bg-surface border border-[#302A24] rounded-2xl p-4 flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-status-active/20 text-status-active flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
           </div>
           <div>
             <p className="text-2xl font-serif text-white leading-tight">{returnedLoans}</p>
             <p className="text-sm text-text-secondary">Đã trả (tổng)</p>
           </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex bg-surface border border-[#302A24] rounded-xl p-1 text-sm">
          <button 
            onClick={() => setStatusFilter('Tất cả')}
            className={`px-4 py-1 rounded-lg transition-colors ${statusFilter === 'Tất cả' ? 'bg-[#302A24] text-white' : 'text-text-secondary hover:text-white'}`}
          >
            Tất cả
          </button>
          <button 
            onClick={() => setStatusFilter('Đang mượn')}
            className={`px-4 py-1 rounded-lg transition-colors ${statusFilter === 'Đang mượn' ? 'bg-[#302A24] text-white' : 'text-text-secondary hover:text-white'}`}
          >
            Đang mượn
          </button>
          <button 
            onClick={() => setStatusFilter('Quá hạn')}
            className={`px-4 py-1 rounded-lg transition-colors ${statusFilter === 'Quá hạn' ? 'bg-[#302A24] text-white' : 'text-text-secondary hover:text-white'}`}
          >
            Quá hạn
          </button>
          <button 
            onClick={() => setStatusFilter('Đã trả')}
            className={`px-4 py-1 rounded-lg transition-colors ${statusFilter === 'Đã trả' ? 'bg-[#302A24] text-white' : 'text-text-secondary hover:text-white'}`}
          >
            Đã trả
          </button>
        </div>
        <button 
          onClick={() => {
            const defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() + (config.maxLoanDays || 14));
            // Format YYYY-MM-DD
            setDueDateStr(defaultDate.toISOString().split('T')[0]);
            setIsModalOpen(true);
          }}
          className="bg-primary text-background px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primaryHover transition-colors flex items-center gap-2"
        >
          Cho mượn sách
        </button>
      </div>

      <div className="bg-surface border border-[#302A24] rounded-2xl overflow-hidden min-h-[300px]">
        {loading ? (
           <div className="text-center text-text-secondary py-20">Đang tải dữ liệu...</div>
        ) : filteredBorrowings.length === 0 ? (
           <div className="text-center text-text-secondary py-20">
             <p className="mb-2">Không tìm thấy giao dịch nào khớp với bộ lọc.</p>
           </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1A1614] text-text-secondary text-xs uppercase font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Sách</th>
                <th className="px-6 py-4 font-medium">Thành viên</th>
                <th className="px-6 py-4 font-medium">Ngày mượn</th>
                <th className="px-6 py-4 font-medium">Hạn trả</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#302A24]">
              {filteredBorrowings.map((b) => (
                <tr key={b.id} className="hover:bg-surfaceHover transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-8 bg-genre-${(b.bookGenre || 'classic').toLowerCase()} rounded-sm`}></div>
                      <div>
                        <p className="font-serif font-bold text-white">{b.bookTitle}</p>
                        <p className="text-[10px] text-text-secondary">{b.bookAuthor}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">{b.memberName}</td>
                  <td className="px-6 py-4 text-text-secondary">{formatDate(b.issueDate)}</td>
                  <td className="px-6 py-4 text-text-secondary">{formatDate(b.dueDate)}</td>
                  <td className="px-6 py-4">
                    {b.status === 'Đang mượn' ? (
                       <span className="px-2 py-1 text-[10px] rounded bg-[#302A24] text-status-active font-bold uppercase border border-status-active/20">Đang mượn</span>
                    ) : b.status === 'Quá hạn' ? (
                       <span className="px-2 py-1 text-[10px] rounded bg-[#302A24] text-status-overdue font-bold uppercase border border-status-overdue/20">Quá hạn</span>
                    ) : (
                       <span className="px-2 py-1 text-[10px] rounded bg-[#302A24] text-text-secondary font-bold uppercase">Đã trả</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {b.status !== 'Đã trả' && (
                      <button 
                        onClick={() => handleReturnBook(b)}
                        className="text-primary hover:text-white text-xs font-medium border border-[#302A24] px-3 py-1 rounded bg-surface transition-colors"
                      >
                        Nhận trả sách
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Cho Mượn Sách */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-surface border border-[#302A24] rounded-2xl p-6 w-full max-w-md shadow-2xl overflow-visible">
            <h3 className="text-xl font-serif text-white mb-6">Cho mượn sách</h3>
            
            {books.length === 0 || members.length === 0 ? (
              <div className="text-status-overdue text-sm mb-4">
                Vui lòng đảm bảo bạn đã tạo ít nhất 1 cuốn sách và 1 thành viên trước khi cho mượn.
              </div>
            ) : (
              <form onSubmit={handleIssueBook} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Chọn Sách</label>
                  <select 
                    required 
                    value={selectedBookId} 
                    onChange={(e) => setSelectedBookId(e.target.value)} 
                    className="w-full bg-background border border-[#302A24] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-primary/50"
                  >
                    <option value="" disabled>-- Chọn một cuốn sách --</option>
                    {books.map(book => (
                      <option key={book.id} value={book.id}>{book.title} ({book.available} cuốn có sẵn)</option>
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
                    <option value="" disabled>-- Chọn thành viên --</option>
                    {members.map(member => (
                      <option key={member.id} value={member.id}>{member.name} ({member.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Hạn trả (Due Date)</label>
                  <input 
                    required 
                    type="date" 
                    value={dueDateStr} 
                    onChange={(e) => setDueDateStr(e.target.value)} 
                    className="w-full bg-background border border-[#302A24] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-primary/50 [color-scheme:dark]" 
                  />
                </div>
                
                <div className="flex gap-3 mt-8 pt-4 border-t border-[#302A24]">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-transparent border border-[#302A24] text-white py-2 rounded-lg text-sm font-medium hover:bg-surfaceHover transition-colors">
                    Hủy
                  </button>
                  <button type="submit" className="flex-1 bg-primary text-background py-2 rounded-lg text-sm font-semibold hover:bg-primaryHover transition-colors">
                    Tạo phiếu mượn
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
