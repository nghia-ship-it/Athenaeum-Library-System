import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function BookCatalog() {
  const [books, setBooks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: 'Kinh điển', // Default genre
    year: '',
    shelf: '',
    total: 1
  });

  // Filter & Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('Tất cả thể loại');
  const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');

  useEffect(() => {
    // Lắng nghe dữ liệu realtime từ collection 'books'
    const unsubscribe = onSnapshot(collection(db, 'books'), (snapshot) => {
      const bookData = [];
      snapshot.forEach((doc) => {
        bookData.push({ id: doc.id, ...doc.data() });
      });
      setBooks(bookData);
      setLoading(false);
    }, (error) => {
      console.error("Lỗi khi tải dữ liệu sách:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'total' || name === 'year' ? Number(value) : value
    }));
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      // Mapping English genre for styling (internal use)
      const genreMap = {
        'Kinh điển': 'Classic',
        'Viễn tưởng': 'Fiction',
        'Lãng mạn': 'Romance',
        'Khoa học': 'SciFi',
        'Kỳ ảo': 'Fantasy',
        'Thơ ca': 'Poetry',
        'Lịch sử': 'History'
      };

      const engGenre = genreMap[formData.genre] || 'Classic';
      const available = formData.total; // Mặc định khi mới thêm, tất cả sách đều có sẵn

      await addDoc(collection(db, 'books'), {
        title: formData.title,
        author: formData.author,
        genre: formData.genre,
        engGenre: engGenre,
        year: formData.year,
        shelf: formData.shelf,
        total: formData.total,
        available: available,
        status: 'Có sẵn',
        createdAt: new Date()
      });

      // Reset form & close modal
      setFormData({ title: '', author: '', genre: 'Kinh điển', year: '', shelf: '', total: 1 });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Lỗi khi thêm sách:", error);
      alert("Đã xảy ra lỗi khi thêm sách. Vui lòng thử lại.");
    }
  };

  const filteredBooks = books.filter(book => {
    const matchSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGenre = genreFilter === 'Tất cả thể loại' || book.genre === genreFilter;
    
    let matchStatus = true;
    if (statusFilter === 'Có sẵn') matchStatus = book.available > 0;
    if (statusFilter === 'Đang mượn') matchStatus = book.available === 0;

    return matchSearch && matchGenre && matchStatus;
  });

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 flex-1">
          <input 
            type="text" 
            placeholder="Tìm tên sách hoặc tác giả..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-1/3 bg-surface border border-[#302A24] rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-primary/50 text-white placeholder-text-secondary/70 transition-colors"
          />
          <select 
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="bg-surface border border-[#302A24] rounded-xl py-2 px-4 text-sm focus:outline-none text-white"
          >
            <option value="Tất cả thể loại">Tất cả thể loại</option>
            <option value="Kinh điển">Kinh điển</option>
            <option value="Viễn tưởng">Viễn tưởng</option>
            <option value="Lãng mạn">Lãng mạn</option>
            <option value="Khoa học">Khoa học</option>
            <option value="Kỳ ảo">Kỳ ảo</option>
            <option value="Thơ ca">Thơ ca</option>
            <option value="Lịch sử">Lịch sử</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface border border-[#302A24] rounded-xl py-2 px-4 text-sm focus:outline-none text-white"
          >
            <option value="Tất cả trạng thái">Tất cả trạng thái</option>
            <option value="Có sẵn">Có sẵn</option>
            <option value="Đang mượn">Đang mượn</option>
          </select>
          <div className="text-text-secondary text-sm flex items-center px-2">
            {filteredBooks.length} tựa sách
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-background px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primaryHover transition-colors"
        >
          + Thêm sách
        </button>
      </div>

      {loading ? (
        <div className="text-center text-text-secondary py-20">Đang tải dữ liệu từ Database...</div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center text-text-secondary py-20 border border-dashed border-[#302A24] rounded-2xl bg-surface">
          <p className="mb-2">Không tìm thấy sách nào khớp với bộ lọc.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map((book) => {
            const genreColorClass = `bg-genre-${(book.engGenre || 'classic').toLowerCase()}`;
            const isAvailable = book.available > 0;
            const statusColor = isAvailable ? 'text-status-active' : 'text-status-overdue';
            const displayStatus = isAvailable ? 'Có sẵn' : 'Đang mượn';

            return (
              <div key={book.id} className="bg-surface border border-[#302A24] rounded-2xl p-4 flex gap-4 hover:border-[#4A4036] transition-colors cursor-pointer group">
                <div className={`w-20 rounded-lg flex flex-col justify-center p-2 items-center text-center shadow-inner relative overflow-hidden ${genreColorClass}`}>
                   <div className="absolute inset-0 bg-black/20 mix-blend-overlay"></div>
                   <span className="text-[9px] font-bold text-white/90 uppercase tracking-widest mb-1 leading-tight">{book.genre}</span>
                   <span className="text-sm font-serif font-bold text-white leading-tight">{book.title}</span>
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-white font-serif font-bold text-base leading-tight mb-1">{book.title}</h3>
                      <span className={`text-xs font-medium ${statusColor}`}>{displayStatus}</span>
                    </div>
                    <p className="text-xs text-text-secondary mb-3">{book.author}</p>
                    
                    <div className="flex gap-2">
                      <span className={`px-2 py-0.5 text-[10px] rounded bg-[#302A24] ${genreColorClass.replace('bg-', 'text-')}`}>{book.genre}</span>
                      <span className="px-2 py-0.5 text-[10px] rounded bg-[#302A24] text-text-secondary">{book.year}</span>
                      <span className="px-2 py-0.5 text-[10px] rounded bg-[#302A24] text-text-secondary">Kệ {book.shelf}</span>
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
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Thêm Sách */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-surface border border-[#302A24] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-serif text-white mb-6">Thêm sách mới</h3>
            <form onSubmit={handleAddBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Tên sách</label>
                <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-background border border-[#302A24] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Tác giả</label>
                <input required type="text" name="author" value={formData.author} onChange={handleInputChange} className="w-full bg-background border border-[#302A24] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-primary/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Thể loại</label>
                  <select name="genre" value={formData.genre} onChange={handleInputChange} className="w-full bg-background border border-[#302A24] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-primary/50">
                    <option value="Kinh điển">Kinh điển</option>
                    <option value="Viễn tưởng">Viễn tưởng</option>
                    <option value="Lãng mạn">Lãng mạn</option>
                    <option value="Khoa học">Khoa học</option>
                    <option value="Kỳ ảo">Kỳ ảo</option>
                    <option value="Thơ ca">Thơ ca</option>
                    <option value="Lịch sử">Lịch sử</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Năm XB</label>
                  <input required type="number" name="year" value={formData.year} onChange={handleInputChange} className="w-full bg-background border border-[#302A24] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-primary/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Vị trí Kệ</label>
                  <input required type="text" name="shelf" value={formData.shelf} onChange={handleInputChange} placeholder="VD: A-01" className="w-full bg-background border border-[#302A24] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Số lượng bản</label>
                  <input required type="number" min="1" name="total" value={formData.total} onChange={handleInputChange} className="w-full bg-background border border-[#302A24] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-primary/50" />
                </div>
              </div>
              
              <div className="flex gap-3 mt-8 pt-4 border-t border-[#302A24]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-transparent border border-[#302A24] text-white py-2 rounded-lg text-sm font-medium hover:bg-surfaceHover transition-colors">
                  Hủy
                </button>
                <button type="submit" className="flex-1 bg-primary text-background py-2 rounded-lg text-sm font-semibold hover:bg-primaryHover transition-colors">
                  Lưu sách
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
