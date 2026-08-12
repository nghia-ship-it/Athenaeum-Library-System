import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Search, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function MemberPortal() {
  const [email, setEmail] = useState('');
  const [memberInfo, setMemberInfo] = useState(null);
  const [borrowings, setBorrowings] = useState([]);
  const [fines, setFines] = useState([]);
  const [books, setBooks] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Lấy danh sách sách realtime cho Catalog
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'books'), (snapshot) => {
      const bookData = [];
      snapshot.forEach((doc) => {
        bookData.push({ id: doc.id, ...doc.data() });
      });
      setBooks(bookData);
    });
    return () => unsubscribe();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoadingSearch(true);
    setErrorMsg('');
    setMemberInfo(null);
    setBorrowings([]);
    setFines([]);

    try {
      // 1. Tìm member theo email
      const q = query(collection(db, 'members'), where('email', '==', email.trim()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setErrorMsg('Không tìm thấy thành viên nào với email này.');
        setLoadingSearch(false);
        return;
      }

      const memberDoc = querySnapshot.docs[0];
      const memberData = { id: memberDoc.id, ...memberDoc.data() };
      setMemberInfo(memberData);

      // 2. Tìm mượn trả
      const borrowQ = query(collection(db, 'borrowings'), where('memberId', '==', memberData.id));
      const borrowSnapshot = await getDocs(borrowQ);
      const borrowData = [];
      borrowSnapshot.forEach(doc => borrowData.push({ id: doc.id, ...doc.data() }));
      
      // Lọc ra các sách Đang mượn hoặc Quá hạn
      const activeBorrowings = borrowData.filter(b => b.status === 'Đang mượn' || b.status === 'Quá hạn');
      setBorrowings(activeBorrowings);

      // 3. Tìm phạt
      const fineQ = query(collection(db, 'fines'), where('memberId', '==', memberData.id));
      const fineSnapshot = await getDocs(fineQ);
      const fineData = [];
      fineSnapshot.forEach(doc => fineData.push({ id: doc.id, ...doc.data() }));
      
      const activeFines = fineData.filter(f => f.status === 'Chưa thanh toán');
      setFines(activeFines);

    } catch (error) {
      console.error("Lỗi khi tra cứu:", error);
      setErrorMsg('Đã xảy ra lỗi khi tra cứu dữ liệu.');
    }
    setLoadingSearch(false);
  };

  const calculateTotalFines = () => {
    return fines.reduce((total, fine) => total + (Number(fine.amount) || 0), 0);
  };

  const handleReserve = async (book) => {
    if (!memberInfo) return;
    
    if (window.confirm(`Bạn có chắc muốn đặt trước cuốn "${book.title}"?`)) {
      try {
        const status = book.available > 0 ? 'Sẵn sàng' : 'Chờ sách';
        await addDoc(collection(db, 'reservations'), {
          bookId: book.id,
          bookTitle: book.title,
          bookAuthor: book.author,
          bookGenre: book.genre,
          engGenre: book.engGenre,
          memberId: memberInfo.id,
          memberName: memberInfo.name,
          memberEmail: memberInfo.email,
          status: status,
          createdAt: new Date(),
          expiryDate: status === 'Sẵn sàng' ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) : null
        });
        alert(`Đã tạo phiếu đặt sách "${book.title}" thành công!\nVui lòng đến thư viện để nhận sách.`);
      } catch (error) {
        console.error("Lỗi đặt sách:", error);
        alert('Đã xảy ra lỗi khi đặt sách. Vui lòng thử lại sau.');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-16">
      
      {/* Search Section */}
      <section className="bg-surface border border-[#302A24] rounded-2xl p-8 shadow-xl max-w-2xl mx-auto relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50"></div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-serif font-bold text-white mb-2">Tra cứu thẻ thư viện</h2>
          <p className="text-text-secondary text-sm">Nhập email đã đăng ký của bạn để kiểm tra sách đang mượn và các khoản phạt.</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input 
              type="email" 
              placeholder="VD: email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-[#302A24] rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loadingSearch}
            className="bg-primary text-background px-6 py-3 rounded-xl font-bold hover:bg-primaryHover transition-colors disabled:opacity-50"
          >
            {loadingSearch ? 'Đang tìm...' : 'Tra cứu'}
          </button>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
            {errorMsg}
          </div>
        )}
      </section>

      {/* Result Section */}
      {memberInfo && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Member Card */}
          <div className="bg-surface border border-[#302A24] rounded-2xl p-6 lg:col-span-1">
            <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center text-2xl font-bold mb-4">
              {memberInfo.initials || memberInfo.name.substring(0, 2).toUpperCase()}
            </div>
            <h3 className="text-xl font-serif font-bold text-white mb-1">{memberInfo.name}</h3>
            <p className="text-text-secondary text-sm mb-6">{memberInfo.email}</p>
            
            <div className="space-y-4 pt-6 border-t border-[#302A24]">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary text-sm">Đang mượn</span>
                <span className="font-bold text-white">{borrowings.length} cuốn</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary text-sm">Tiền phạt</span>
                <span className="font-bold text-status-overdue">{calculateTotalFines().toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
          </div>

          {/* Borrowings & Fines */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Borrowings List */}
            <div className="bg-surface border border-[#302A24] rounded-2xl p-6">
              <h3 className="text-lg font-serif font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen size={18} className="text-primary" /> Sách đang mượn
              </h3>
              {borrowings.length === 0 ? (
                <p className="text-text-secondary text-sm py-4">Bạn không có cuốn sách nào đang mượn.</p>
              ) : (
                <div className="space-y-3">
                  {borrowings.map(b => {
                    const dueDate = b.dueDate?.toDate ? b.dueDate.toDate() : new Date(b.dueDate);
                    const isOverdue = b.status === 'Quá hạn';
                    const bookInfo = books.find(book => book.id === b.bookId);

                    return (
                      <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border border-[#302A24] bg-background">
                        <div>
                          <p className="font-medium text-white text-sm">{bookInfo?.title || 'Sách không xác định'}</p>
                          <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                            <Clock size={12} />
                            Hạn trả: {format(dueDate, 'dd/MM/yyyy')}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isOverdue ? 'bg-status-overdue/20 text-status-overdue' : 'bg-status-active/20 text-status-active'}`}>
                          {b.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Fines List */}
            {fines.length > 0 && (
              <div className="bg-surface border border-status-overdue/30 rounded-2xl p-6">
                <h3 className="text-lg font-serif font-bold text-white mb-4 flex items-center gap-2">
                  <AlertCircle size={18} className="text-status-overdue" /> Khoản phạt chưa đóng
                </h3>
                <div className="space-y-3">
                  {fines.map(f => (
                    <div key={f.id} className="flex items-center justify-between p-3 rounded-lg border border-[#302A24] bg-background">
                      <div>
                        <p className="font-medium text-white text-sm">{f.reason}</p>
                        <p className="text-xs text-text-secondary mt-1">Sách: {f.bookTitle || 'Không xác định'}</p>
                      </div>
                      <span className="font-bold text-status-overdue">
                        {Number(f.amount).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </section>
      )}

      {/* Catalog Section */}
      <section>
        <div className="mb-8 border-b border-[#302A24] pb-4">
          <h2 className="text-2xl font-serif font-bold text-white">Danh mục sách thư viện</h2>
          <p className="text-text-secondary text-sm mt-1">Khám phá các tựa sách hiện có trong hệ thống Athenaeum.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => {
            const genreColorClass = `bg-genre-${(book.engGenre || 'classic').toLowerCase()}`;
            const isAvailable = book.available > 0;
            const statusColor = isAvailable ? 'text-status-active' : 'text-status-overdue';
            const displayStatus = isAvailable ? 'Có sẵn' : 'Hết sách';

            return (
              <div key={book.id} className="bg-surface border border-[#302A24] rounded-2xl p-4 flex gap-4 hover:border-[#4A4036] transition-colors relative">
                <div className={`w-20 rounded-lg flex flex-col justify-center p-2 items-center text-center shadow-inner relative overflow-hidden ${genreColorClass}`}>
                   <div className="absolute inset-0 bg-black/20 mix-blend-overlay"></div>
                   <span className="text-[9px] font-bold text-white/90 uppercase tracking-widest mb-1 leading-tight">{book.genre}</span>
                   <span className="text-sm font-serif font-bold text-white leading-tight">{book.title}</span>
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-white font-serif font-bold text-base leading-tight mb-1 pr-2">{book.title}</h3>
                      <span className={`text-xs font-medium whitespace-nowrap ${statusColor}`}>{displayStatus}</span>
                    </div>
                    <p className="text-xs text-text-secondary mb-3">{book.author}</p>
                    
                    <div className="flex gap-2">
                      <span className={`px-2 py-0.5 text-[10px] rounded bg-[#302A24] ${genreColorClass.replace('bg-', 'text-')}`}>{book.genre}</span>
                      <span className="px-2 py-0.5 text-[10px] rounded bg-[#302A24] text-text-secondary">{book.year}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-text-secondary mb-1">
                      <span>Đang mượn</span>
                      <span>{book.total - book.available}/{book.total}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#302A24] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500" 
                        style={{ width: `${((book.total - book.available) / book.total) * 100}%` }}
                      ></div>
                    </div>
                    {memberInfo && (
                      <button 
                        onClick={() => handleReserve(book)}
                        className="w-full mt-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-background transition-colors text-xs font-bold uppercase"
                      >
                        Đặt sách
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

    </div>
  );
}
