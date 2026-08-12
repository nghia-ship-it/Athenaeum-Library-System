import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PopularBooks({ popularBooks }) {
  const navigate = useNavigate();

  return (
    <div className="bg-surface border border-[#302A24] rounded-2xl p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-white font-serif text-lg">Phổ biến tháng này</h3>
          <p className="text-sm text-text-secondary">Sách được mượn nhiều nhất</p>
        </div>
        <button 
          onClick={() => navigate('/admin/books')}
          className="text-xs text-text-secondary hover:text-white transition-colors"
        >
          Xem tất cả
        </button>
      </div>
      
      <div className="flex-1">
        {popularBooks.length === 0 ? (
          <div className="text-center text-text-secondary py-10">Chưa có dữ liệu</div>
        ) : (
          <div className="space-y-5">
            {popularBooks.map((book, idx) => {
              const maxCount = Math.max(...popularBooks.map(b => b.count), 1);
              const percent = (book.count / maxCount) * 100;
              return (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <div className="w-5 h-6 bg-[#302A24] rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-serif text-white opacity-50">📖</span>
                      </div>
                      <span className="text-white font-medium truncate">{book.title}</span>
                    </div>
                    <span className="text-text-secondary text-xs flex-shrink-0">{book.count} lượt</span>
                  </div>
                  <div className="w-full bg-[#1A1614] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full" 
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
