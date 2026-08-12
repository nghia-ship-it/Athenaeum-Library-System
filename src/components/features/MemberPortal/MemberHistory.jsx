import React from 'react';
import { BookOpen, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function MemberHistory({ memberInfo, borrowings, fines, books }) {
  const calculateTotalFines = () => {
    return fines.reduce((total, fine) => total + (Number(fine.amount) || 0), 0);
  };

  if (!memberInfo) return null;

  return (
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
  );
}
