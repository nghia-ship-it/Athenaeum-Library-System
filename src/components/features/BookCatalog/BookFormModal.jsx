import React from 'react';

export default function BookFormModal({ 
  isOpen, 
  onClose, 
  editingId, 
  formData, 
  handleInputChange, 
  handleAddBook 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-surface border border-[#302A24] rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-serif text-white mb-6">
          {editingId ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
        </h3>
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
              <label className="block text-sm font-medium text-text-secondary mb-1">Tổng số lượng</label>
              <input required type="number" min="1" name="total" value={formData.total} onChange={handleInputChange} className="w-full bg-background border border-[#302A24] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-primary/50" />
            </div>
          </div>
          
          <div className="flex gap-3 mt-8 pt-4 border-t border-[#302A24]">
            <button type="button" onClick={onClose} className="flex-1 bg-transparent border border-[#302A24] text-white py-2 rounded-lg text-sm font-medium hover:bg-surfaceHover transition-colors">
              Hủy
            </button>
            <button type="submit" className="flex-1 bg-primary text-background py-2 rounded-lg text-sm font-semibold hover:bg-primaryHover transition-colors">
              {editingId ? 'Cập nhật' : 'Lưu sách'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
