import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';

export default function BorrowingCreateModal({ isOpen, onClose, books, members, config }) {
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [dueDateStr, setDueDateStr] = useState('');

  useEffect(() => {
    if (isOpen) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + (config.maxLoanDays || 14));
      setDueDateStr(defaultDate.toISOString().split('T')[0]);
    } else {
      setSelectedBookId('');
      setSelectedMemberId('');
      setDueDateStr('');
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleIssueBook = async (e) => {
    e.preventDefault();
    if (!selectedBookId || !selectedMemberId || !dueDateStr) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
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

      await updateDoc(bookRef, {
        available: bookData.available - 1
      });

      await updateDoc(memberRef, {
        booksOut: (memberData.booksOut || 0) + 1
      });

      onClose();

    } catch (error) {
      console.error("Lỗi khi cho mượn sách:", error);
      alert("Đã xảy ra lỗi.");
    }
  };

  return (
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
              <button type="button" onClick={onClose} className="flex-1 bg-transparent border border-[#302A24] text-white py-2 rounded-lg text-sm font-medium hover:bg-surfaceHover transition-colors">
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
  );
}
