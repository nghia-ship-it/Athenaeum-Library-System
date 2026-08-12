import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, BookOpen, Users, AlertCircle } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { format, subDays, startOfDay, startOfMonth, subMonths, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    monthlyBorrows: 0,
    newMembers: 0,
    overdueBooks: 0,
    totalFineRevenue: 0
  });

  const [genreData, setGenreData] = useState([]);
  const [membershipData, setMembershipData] = useState([]);
  const [overdueList, setOverdueList] = useState([]);
  const [topBooksData, setTopBooksData] = useState([]);

  useEffect(() => {
    const today = new Date();
    const currentMonthStart = startOfMonth(today).getTime();

    const unsubBooks = onSnapshot(collection(db, 'books'), (snapshot) => {
      const booksMap = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        booksMap[doc.id] = { genre: data.genre || 'Khác', title: data.title || 'Unknown', author: data.author || 'Unknown' };
      });

      const unsubBorrowings = onSnapshot(collection(db, 'borrowings'), (bSnapshot) => {
        let mBorrows = 0;
        let overdueCount = 0;
        const genreCounts = {};
        const bookCounts = {};
        const overdueItems = [];

        bSnapshot.forEach(doc => {
          const data = doc.data();
          
          // Count Monthly Borrows
          const issueDate = data.issueDate?.toDate ? data.issueDate.toDate() : new Date(data.issueDate);
          if (issueDate && issueDate.getTime() >= currentMonthStart) {
            mBorrows++;
          }

          // Checkouts by genre and book
          const bookInfo = booksMap[data.bookId] || { genre: 'Khác', title: data.bookTitle || 'Unknown', author: 'Unknown' };
          genreCounts[bookInfo.genre] = (genreCounts[bookInfo.genre] || 0) + 1;
          
          if (!bookCounts[data.bookId]) {
            bookCounts[data.bookId] = { count: 0, title: bookInfo.title, author: bookInfo.author };
          }
          bookCounts[data.bookId].count++;

          // Overdue
          if (data.status === 'Quá hạn') {
            overdueCount++;
            overdueItems.push({ id: doc.id, ...data });
          }
        });

        // Format Genre Data
        const gData = Object.keys(genreCounts).map(g => ({
          name: g,
          Checkouts: genreCounts[g]
        })).sort((a, b) => b.Checkouts - a.Checkouts).slice(0, 5); // top 5 genres

        // Format Top Books Data
        const tbData = Object.values(bookCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setGenreData(gData);
        setTopBooksData(tbData);
        setOverdueList(overdueItems.slice(0, 5)); // top 5 overdue
        setStats(prev => ({ ...prev, monthlyBorrows: mBorrows, overdueBooks: overdueCount }));
      });

      return () => unsubBorrowings();
    });

    // Membership Growth (last 6 months)
    const unsubMembers = onSnapshot(collection(db, 'members'), (snapshot) => {
      let nMembers = 0;
      
      const last6Months = Array.from({length: 6}).map((_, i) => {
        const d = subMonths(new Date(), 5 - i);
        return {
          monthStart: startOfMonth(d).getTime(),
          name: format(d, 'MM/yyyy'),
          'New Members': 0
        };
      });

      snapshot.forEach(doc => {
        const data = doc.data();
        const created = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        
        if (created && created.getTime() >= currentMonthStart) {
          nMembers++;
        }

        if (created) {
          const mTime = startOfMonth(created).getTime();
          const targetMonth = last6Months.find(m => m.monthStart === mTime);
          if (targetMonth) {
            targetMonth['New Members']++;
          }
        }
      });
      
      setMembershipData(last6Months);
      setStats(prev => ({ ...prev, newMembers: nMembers }));
    });

    const unsubFines = onSnapshot(collection(db, 'fines'), (snapshot) => {
      let revenue = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'Đã thanh toán') {
          revenue += data.amount || 0;
        }
      });
      setStats(prev => ({ ...prev, totalFineRevenue: revenue }));
      setLoading(false);
    });

    return () => {
      unsubBooks();
      unsubMembers();
      unsubFines();
    };
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1A1614] border border-[#302A24] p-3 rounded-lg shadow-xl">
          <p className="text-white mb-2 font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleExportCSV = () => {
    // Generate CSV content
    const headers = ['Thanh Vien', 'Sach', 'Ngay Muon', 'Han Tra', 'Trang Thai'];
    const rows = overdueList.map(item => {
      const issue = item.issueDate?.toDate ? item.issueDate.toDate() : new Date(item.issueDate);
      const due = item.returnDate?.toDate ? item.returnDate.toDate() : new Date(item.returnDate);
      return [
        `"${item.memberName || 'Unknown'}"`,
        `"${item.bookTitle || 'Unknown'}"`,
        format(issue, 'dd/MM/yyyy'),
        format(due, 'dd/MM/yyyy'),
        'Qua han'
      ].join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bao-cao-qua-han-${format(new Date(), 'dd-MM-yyyy')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[
          { label: 'Tổng lượt mượn (Tháng)', value: stats.monthlyBorrows, icon: BookOpen, color: 'text-[#C68A48]' },
          { label: 'Thành viên mới (Tháng)', value: stats.newMembers, icon: Users, color: 'text-[#6A9E6B]' },
          { label: 'Sách đang trễ hạn', value: stats.overdueBooks, icon: TrendingUp, color: 'text-[#C36453]' },
          { label: 'Doanh thu phạt', value: `$${stats.totalFineRevenue.toFixed(2)}`, icon: BarChart2, color: 'text-[#5F85A1]' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-surface border border-[#302A24] rounded-2xl p-5 hover:border-[#4A4036] transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg bg-[#302A24] ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <p className="text-2xl font-serif text-white mb-1">{loading ? '...' : stat.value}</p>
            <p className="text-xs text-text-secondary">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Checkouts by Genre - BarChart */}
        <div className="bg-surface border border-[#302A24] rounded-2xl p-6 flex flex-col">
          <h3 className="text-white font-serif text-lg mb-4">Mượn sách theo thể loại</h3>
          <div style={{ width: '100%', height: 300 }}>
            {loading ? (
               <div className="h-full flex items-center justify-center text-text-secondary">Đang tải...</div>
            ) : (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={genreData} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#302A24" horizontal={false} />
                   <XAxis type="number" stroke="#8C7D64" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                   <YAxis dataKey="name" type="category" stroke="#8C7D64" fontSize={12} tickLine={false} axisLine={false} width={80} />
                   <Tooltip content={<CustomTooltip />} cursor={{fill: '#2A241E'}} />
                   <Bar dataKey="Checkouts" fill="#5F85A1" radius={[0, 4, 4, 0]} barSize={20} />
                 </BarChart>
               </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Membership Growth - LineChart */}
        <div className="bg-surface border border-[#302A24] rounded-2xl p-6 flex flex-col">
          <h3 className="text-white font-serif text-lg mb-4">Tăng trưởng thành viên</h3>
          <div style={{ width: '100%', height: 300 }}>
            {loading ? (
               <div className="h-full flex items-center justify-center text-text-secondary">Đang tải...</div>
            ) : (
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={membershipData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#302A24" vertical={false} />
                   <XAxis dataKey="name" stroke="#8C7D64" fontSize={12} tickLine={false} axisLine={false} />
                   <YAxis stroke="#8C7D64" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                   <Tooltip content={<CustomTooltip />} />
                   <Line type="monotone" dataKey="New Members" stroke="#6A8B5F" strokeWidth={3} dot={{ r: 4, fill: '#6A8B5F', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                 </LineChart>
               </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Books Table */}
        <div className="bg-surface border border-[#302A24] rounded-2xl p-6 flex flex-col">
          <h3 className="text-white font-serif text-lg mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-[#C68A48]" />
            Top Sách Mượn Nhiều Nhất
          </h3>
          <div className="flex-1 overflow-x-auto">
            {loading ? (
              <div className="text-center text-text-secondary py-10">Đang tải...</div>
            ) : topBooksData.length === 0 ? (
              <div className="text-center text-text-secondary py-10 bg-[#1A1614] rounded-lg border border-[#302A24] border-dashed">
                Chưa có dữ liệu mượn sách.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="text-text-secondary text-xs uppercase font-semibold tracking-wider bg-[#1A1614]">
                  <tr>
                    <th className="p-3 rounded-tl-lg font-medium">Tựa sách</th>
                    <th className="p-3 font-medium">Tác giả</th>
                    <th className="p-3 rounded-tr-lg font-medium text-right">Lượt mượn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#302A24]">
                  {topBooksData.map((book, idx) => (
                    <tr key={idx} className="hover:bg-[#2A241E] transition-colors">
                      <td className="p-3">
                        <span className="text-white font-medium line-clamp-1">{book.title}</span>
                      </td>
                      <td className="p-3 text-text-secondary line-clamp-1">{book.author}</td>
                      <td className="p-3 text-right">
                        <span className="bg-[#5F85A1]/20 text-[#5F85A1] px-2 py-1 rounded font-bold border border-[#5F85A1]/30">
                          {book.count}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Overdue Watchlist */}
        <div className="bg-surface border border-[#302A24] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-white font-serif text-lg flex items-center gap-2">
                <AlertCircle size={20} className="text-[#C36453]" />
                Sách quá hạn
              </h3>
            </div>
            <button onClick={handleExportCSV} className="text-xs text-primary hover:text-white transition-colors border border-primary/30 hover:border-primary px-3 py-1.5 rounded-lg">
              Xuất CSV
            </button>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            {loading ? (
              <div className="text-center text-text-secondary py-10">Đang tải...</div>
            ) : overdueList.length === 0 ? (
              <div className="text-center text-text-secondary py-10 bg-[#1A1614] rounded-lg border border-[#302A24] border-dashed">
                Tuyệt vời! Không có sách nào quá hạn.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="text-text-secondary text-xs uppercase font-semibold tracking-wider bg-[#1A1614]">
                  <tr>
                    <th className="p-3 rounded-tl-lg font-medium">Thành viên</th>
                    <th className="p-3 font-medium">Sách</th>
                    <th className="p-3 rounded-tr-lg font-medium text-right">Phạt dự kiến</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#302A24]">
                  {overdueList.map((item, idx) => {
                    const due = item.returnDate?.toDate ? item.returnDate.toDate() : new Date(item.returnDate);
                    const diffTime = Math.abs(new Date() - due);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const estimatedFine = (diffDays * 0.5).toFixed(2);

                    return (
                      <tr key={idx} className="hover:bg-[#2A241E] transition-colors group">
                        <td className="p-3">
                           <span className="text-white font-medium">{item.memberName || 'Unknown'}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-text-secondary line-clamp-1">{item.bookTitle}</span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="bg-[#C36453]/20 text-[#C36453] px-2 py-1 rounded text-xs font-bold border border-[#C36453]/30">
                            ${estimatedFine}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
