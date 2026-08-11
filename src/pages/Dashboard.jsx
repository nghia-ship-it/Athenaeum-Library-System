import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    activeLoans: 0,
    overdueLoans: 0
  });

  useEffect(() => {
    const unsubBooks = onSnapshot(collection(db, 'books'), (snapshot) => {
      setStats(prev => ({ ...prev, totalBooks: snapshot.size }));
    });

    const unsubMembers = onSnapshot(collection(db, 'members'), (snapshot) => {
      setStats(prev => ({ ...prev, totalMembers: snapshot.size }));
    });

    const unsubBorrowings = onSnapshot(collection(db, 'borrowings'), (snapshot) => {
      let active = 0;
      let overdue = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'Đang mượn') active++;
        if (data.status === 'Quá hạn') overdue++;
      });
      setStats(prev => ({ ...prev, activeLoans: active, overdueLoans: overdue }));
    });

    return () => {
      unsubBooks();
      unsubMembers();
      unsubBorrowings();
    };
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface border border-[#302A24] rounded-2xl p-6 relative overflow-hidden group hover:border-[#4A4036] transition-colors">
           <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500"></div>
           <p className="text-4xl font-serif text-white mb-2 relative z-10">{stats.totalBooks}</p>
           <p className="text-sm text-text-secondary relative z-10">Sách trong thư viện</p>
        </div>
        <div className="bg-surface border border-[#302A24] rounded-2xl p-6 relative overflow-hidden group hover:border-[#4A4036] transition-colors">
           <div className="absolute top-0 right-0 w-24 h-24 bg-[#6A8B5F]/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500"></div>
           <p className="text-4xl font-serif text-white mb-2 relative z-10">{stats.totalMembers}</p>
           <p className="text-sm text-text-secondary relative z-10">Thành viên đăng ký</p>
        </div>
        <div className="bg-surface border border-[#302A24] rounded-2xl p-6 relative overflow-hidden group hover:border-[#4A4036] transition-colors">
           <div className="absolute top-0 right-0 w-24 h-24 bg-[#5F85A1]/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500"></div>
           <p className="text-4xl font-serif text-white mb-2 relative z-10">{stats.activeLoans}</p>
           <p className="text-sm text-text-secondary relative z-10">Sách đang mượn</p>
        </div>
        <div className="bg-surface border border-[#302A24] rounded-2xl p-6 relative overflow-hidden border-l-4 border-l-[#C36453] group hover:bg-[#2A241E] transition-colors">
           <div className="absolute top-0 right-0 w-24 h-24 bg-[#C36453]/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500"></div>
           <p className="text-4xl font-serif text-[#C36453] mb-2 relative z-10">{stats.overdueLoans}</p>
           <p className="text-sm text-text-secondary relative z-10">Sách quá hạn</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-surface border border-[#302A24] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-white font-serif text-lg">Xu hướng luân chuyển</h3>
              <p className="text-sm text-text-secondary">Lượt mượn vs trả (Dữ liệu mẫu)</p>
            </div>
            <div className="flex gap-2">
               <button className="px-3 py-1 text-xs rounded-lg bg-background border border-[#302A24] text-text-secondary hover:text-white">4 Tuần</button>
               <button className="px-3 py-1 text-xs rounded-lg bg-primary/20 border border-primary/30 text-primary">12 Tuần</button>
               <button className="px-3 py-1 text-xs rounded-lg bg-background border border-[#302A24] text-text-secondary hover:text-white">24 Tuần</button>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center border border-dashed border-[#302A24] rounded-xl text-text-secondary">
             [Biểu đồ Recharts sẽ được thêm vào đây]
          </div>
        </div>
        
        <div className="bg-surface border border-[#302A24] rounded-2xl p-6">
          <h3 className="text-white font-serif text-lg mb-1">Phân bổ thể loại</h3>
          <p className="text-sm text-text-secondary mb-4">Tỷ lệ theo số lượng sách</p>
          <div className="h-48 flex items-center justify-center border border-dashed border-[#302A24] rounded-xl text-text-secondary">
             [Biểu đồ Tròn]
          </div>
          <div className="mt-4 space-y-2">
            {['Kinh điển', 'Viễn tưởng', 'Khoa học', 'Kỳ ảo'].map((genre, i) => {
              const engGenre = ['Classic', 'Fiction', 'SciFi', 'Fantasy'][i];
              return (
                <div key={genre} className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full bg-genre-${engGenre.toLowerCase()} bg-primary`}></span>
                    <span className="text-text-primary">{genre}</span>
                  </span>
                  <span className="text-text-secondary">{(28 - i*5)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
