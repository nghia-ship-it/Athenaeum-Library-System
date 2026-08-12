import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import BorrowingTable from '../components/features/Borrowing/BorrowingTable';
import BorrowingCreateModal from '../components/features/Borrowing/BorrowingCreateModal';

export default function Borrowing() {
  const [borrowings, setBorrowings] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({ maxLoanDays: 14, finePerDay: 0.5 });

  // Filters
  const [statusFilter, setStatusFilter] = useState('Tất cả');

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
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-background px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primaryHover transition-colors flex items-center gap-2"
        >
          Cho mượn sách
        </button>
      </div>

      <div className="bg-surface border border-[#302A24] rounded-2xl overflow-hidden min-h-[300px]">
        <BorrowingTable 
          borrowings={filteredBorrowings} 
          loading={loading} 
          onReturnBook={handleReturnBook} 
        />
      </div>

      <BorrowingCreateModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        books={books}
        members={members}
        config={config}
      />
    </div>
  );
}
