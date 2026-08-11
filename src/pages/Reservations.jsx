import React from 'react';

export default function Reservations() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-serif text-white">Sách đặt trước</h2>
        <button className="bg-primary text-background px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primaryHover transition-colors">
          + Đặt sách mới
        </button>
      </div>

      <div className="bg-surface border border-[#302A24] rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#1A1614] text-text-secondary text-xs uppercase font-semibold tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Sách</th>
              <th className="px-6 py-4 font-medium">Thành viên</th>
              <th className="px-6 py-4 font-medium">Ngày đặt</th>
              <th className="px-6 py-4 font-medium">Hạn nhận sách</th>
              <th className="px-6 py-4 font-medium">Trạng thái</th>
              <th className="px-6 py-4 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#302A24]">
            <tr className="hover:bg-surfaceHover transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-8 bg-genre-classic rounded-sm"></div>
                  <div>
                    <p className="font-serif font-bold text-white">The Picture of Dorian Gray</p>
                    <p className="text-[10px] text-text-secondary">Oscar Wilde</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-white">Emma Woodhouse</td>
              <td className="px-6 py-4 text-text-secondary">10 Thg 8</td>
              <td className="px-6 py-4 text-white">12 Thg 8</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 text-[10px] rounded bg-primary/20 text-primary font-bold uppercase border border-primary/20">Sẵn sàng</span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-primary hover:text-white mr-3">Cho mượn</button>
                <button className="text-status-overdue hover:text-[#ff8080]">Hủy</button>
              </td>
            </tr>
            <tr className="hover:bg-surfaceHover transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-8 bg-genre-scifi rounded-sm"></div>
                  <div>
                    <p className="font-serif font-bold text-white">Neuromancer</p>
                    <p className="text-[10px] text-text-secondary">William Gibson</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-white">Lucas Vance</td>
              <td className="px-6 py-4 text-text-secondary">11 Thg 8</td>
              <td className="px-6 py-4 text-text-secondary">-</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 text-[10px] rounded bg-[#302A24] text-text-secondary font-bold uppercase border border-[#302A24]">Chờ sách</span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-status-overdue hover:text-[#ff8080]">Hủy</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
