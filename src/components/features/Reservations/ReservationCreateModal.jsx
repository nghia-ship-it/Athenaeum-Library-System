import React from 'react';

export default function ReservationCreateModal({
  isOpen,
  onClose,
  books,
  members,
  selectedBookId,
  setSelectedBookId,
  selectedMemberId,
  setSelectedMemberId,
  handleAddReservation
}) {
  if (!isOpen) return null;

  return (
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
            <button type="button" onClick={onClose} className="flex-1 bg-transparent border border-[#302A24] text-white py-2 rounded-lg text-sm font-medium hover:bg-surfaceHover transition-colors">
              Hủy
            </button>
            <button type="submit" className="flex-1 bg-primary text-background py-2 rounded-lg text-sm font-semibold hover:bg-primaryHover transition-colors">
              Tạo đặt trước
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
