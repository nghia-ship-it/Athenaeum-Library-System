import React from 'react';
import { format } from 'date-fns';

export default function BorrowingTable({ borrowings, loading, onReturnBook }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'dd MMM');
  };

  if (loading) {
    return <div className="text-center text-text-secondary py-20">Đang tải dữ liệu...</div>;
  }

  if (borrowings.length === 0) {
    return (
      <div className="text-center text-text-secondary py-20">
        <p className="mb-2">Không tìm thấy giao dịch nào khớp với bộ lọc.</p>
      </div>
    );
  }

  return (
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
        {borrowings.map((b) => (
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
                  onClick={() => onReturnBook(b)}
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
  );
}
