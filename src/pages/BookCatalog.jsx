import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Edit2, Trash2 } from 'lucide-react';
import BookFormModal from '../components/features/BookCatalog/BookFormModal';

export default function BookCatalog() {
  const [books, setBooks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: 'Kinh điển',
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

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ title: '', author: '', genre: 'Kinh điển', year: '', shelf: '', total: 1 });
    setIsModalOpen(true);
  };

  const openEditModal = (book) => {
    setEditingId(book.id);
    setFormData({
      title: book.title,
      author: book.author,
      genre: book.genre,
      year: book.year,
      shelf: book.shelf,
      total: book.total
    });
    setIsModalOpen(true);
  };

  const handleDeleteBook = async (id, title) => {
    if (window.confirm(`Bạn có chắc muốn xóa sách "${title}"?`)) {
      try {
        await deleteDoc(doc(db, 'books', id));
      } catch (error) {
        console.error("Lỗi khi xóa sách:", error);
        alert("Đã xảy ra lỗi khi xóa sách.");
      }
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
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

      if (editingId) {
        // Edit Mode
        const currentBook = books.find(b => b.id === editingId);
        // Calculate new available based on change in total
        const diff = formData.total - currentBook.total;
        const newAvailable = currentBook.available + diff;
        
        if (newAvailable < 0) {
          alert("Số lượng sách không hợp lệ vì hiện đang có người mượn nhiều hơn số lượng mới.");
          return;
        }

        await updateDoc(doc(db, 'books', editingId), {
          title: formData.title,
          author: formData.author,
          genre: formData.genre,
          engGenre: engGenre,
          year: formData.year,
          shelf: formData.shelf,
          total: formData.total,
          available: newAvailable
        });
      } else {
        // Add Mode
        const available = formData.total;
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
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error("Lỗi khi lưu sách:", error);
      alert("Đã xảy ra lỗi khi lưu sách. Vui lòng thử lại.");
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
          onClick={openAddModal}
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
              <div key={book.id} className="bg-surface border border-[#302A24] rounded-2xl p-4 flex gap-4 hover:border-[#4A4036] transition-colors group relative">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(book)} className="p-1.5 bg-[#302A24] text-text-secondary hover:text-white rounded-lg hover:bg-[#4A4036] transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDeleteBook(book.id, book.title)} className="p-1.5 bg-[#302A24] text-text-secondary hover:text-[#C36453] rounded-lg hover:bg-[#4A4036] transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <div className={`w-20 rounded-lg flex flex-col justify-center p-2 items-center text-center shadow-inner relative overflow-hidden ${genreColorClass}`}>
                   <div className="absolute inset-0 bg-black/20 mix-blend-overlay"></div>
                   <span className="text-[9px] font-bold text-white/90 uppercase tracking-widest mb-1 leading-tight">{book.genre}</span>
                   <span className="text-sm font-serif font-bold text-white leading-tight">{book.title}</span>
                </div>
                <div className="flex-1 flex flex-col justify-between py-1 pr-6">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-white font-serif font-bold text-base leading-tight mb-1 pr-4">{book.title}</h3>
                      <span className={`text-xs font-medium whitespace-nowrap ${statusColor}`}>{displayStatus}</span>
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

      <BookFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingId={editingId}
        formData={formData}
        handleInputChange={handleInputChange}
        handleAddBook={handleAddBook}
      />
    </div>
  );
}
