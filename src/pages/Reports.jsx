import React from 'react';
import { BarChart2, TrendingUp, BookOpen, Users } from 'lucide-react';

export default function Reports() {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[
          { label: 'Tổng lượt mượn (Tháng)', value: '342', trend: '+12%', icon: BookOpen, color: 'text-[#C68A48]' },
          { label: 'Thành viên mới', value: '28', trend: '+5%', icon: Users, color: 'text-[#6A9E6B]' },
          { label: 'Sách trễ hạn', value: '14', trend: '-2%', icon: TrendingUp, color: 'text-[#C36453]' },
          { label: 'Doanh thu phạt', value: '$124.50', trend: '+18%', icon: BarChart2, color: 'text-[#5F85A1]' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-surface border border-[#302A24] rounded-2xl p-5 hover:border-[#4A4036] transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg bg-[#302A24] ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className={`text-xs font-bold ${stat.trend.startsWith('+') ? 'text-status-active' : 'text-status-overdue'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-2xl font-serif text-white mb-1">{stat.value}</p>
            <p className="text-xs text-text-secondary">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-[#302A24] rounded-2xl p-6">
          <h3 className="text-white font-serif text-lg mb-4">Top Sách Mượn Nhiều Nhất</h3>
          <div className="space-y-4">
            {[
              { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', borrows: 45, width: '100%' },
              { title: 'Dune', author: 'Frank Herbert', borrows: 38, width: '85%' },
              { title: '1984', author: 'George Orwell', borrows: 32, width: '70%' },
              { title: 'Pride and Prejudice', author: 'Jane Austen', borrows: 28, width: '60%' },
              { title: 'The Hobbit', author: 'J.R.R. Tolkien', borrows: 24, width: '50%' },
            ].map((book, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white font-medium">{book.title} <span className="text-[10px] text-text-secondary font-normal ml-2">{book.author}</span></span>
                  <span className="text-primary font-bold">{book.borrows}</span>
                </div>
                <div className="w-full h-1.5 bg-[#302A24] rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full opacity-80" style={{ width: book.width }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-[#302A24] rounded-2xl p-6">
          <h3 className="text-white font-serif text-lg mb-4">Hoạt động trong tuần</h3>
          <div className="h-64 flex flex-col items-center justify-center border border-dashed border-[#302A24] rounded-xl text-text-secondary">
             <BarChart2 size={32} className="mb-2 opacity-50" />
             <p className="text-sm">Biểu đồ đang được cập nhật</p>
          </div>
        </div>
      </div>
    </div>
  );
}
