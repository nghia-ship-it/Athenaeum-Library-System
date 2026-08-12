import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { format, subDays, startOfDay, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    activeLoans: 0,
    overdueLoans: 0
  });

  const [genreData, setGenreData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [timeFilter, setTimeFilter] = useState('7days');

  const handleExportActivity = () => {
    if (recentActivity.length === 0) return;
    const headers = ['Thành viên', 'Sách', 'Hành động', 'Thời gian'];
    const rows = recentActivity.map(a => {
      const date = a.issueDate?.toDate ? a.issueDate.toDate() : new Date(a.issueDate);
      return `"${a.memberName || ''}","${a.bookTitle || ''}","Đã mượn","${format(date, 'dd/MM/yyyy HH:mm')}"`;
    });
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(',') + "\n" + rows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hoat_dong_gan_day_${format(new Date(), 'dd_MM_yyyy')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Colors based on tailwind config theme
  const COLORS = ['#E6B389', '#5F85A1', '#6A8B5F', '#C36453', '#B8A682', '#A3947B', '#8C7D64'];

  useEffect(() => {
    const unsubBooks = onSnapshot(collection(db, 'books'), (snapshot) => {
      setStats(prev => ({ ...prev, totalBooks: snapshot.size }));
      
      // Calculate genre distribution
      const genreCounts = {};
      snapshot.forEach(doc => {
        const genre = doc.data().genre || 'Khác';
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
      
      const pieData = Object.keys(genreCounts).map(key => ({
        name: key,
        value: genreCounts[key]
      })).sort((a, b) => b.value - a.value);
      
      setGenreData(pieData);
    });

    const unsubMembers = onSnapshot(collection(db, 'members'), (snapshot) => {
      setStats(prev => ({ ...prev, totalMembers: snapshot.size }));
    });

    const unsubBorrowings = onSnapshot(collection(db, 'borrowings'), (snapshot) => {
      let active = 0;
      let overdue = 0;
      
      // Calculate trends for selected period
      const daysCount = timeFilter === '30days' ? 30 : 7;
      const trendDays = Array.from({length: daysCount}).map((_, i) => {
        const d = subDays(new Date(), daysCount - 1 - i);
        return {
          dateObj: startOfDay(d),
          name: format(d, 'dd/MM'),
          'Mượn sách': 0,
          'Trả sách': 0
        };
      });

      const allBorrowings = [];
      const bookCounts = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        allBorrowings.push({ id: doc.id, ...data });

        if (data.status === 'Đang mượn') active++;
        if (data.status === 'Quá hạn') overdue++;
        
        // Count Issue
        if (data.issueDate) {
          const issueD = startOfDay(data.issueDate.toDate ? data.issueDate.toDate() : new Date(data.issueDate));
          const targetDay = trendDays.find(d => d.dateObj.getTime() === issueD.getTime());
          if (targetDay) targetDay['Mượn sách']++;
        }
        
        // Count Return
        if (data.returnDate) {
          const returnD = startOfDay(data.returnDate.toDate ? data.returnDate.toDate() : new Date(data.returnDate));
          const targetDay = trendDays.find(d => d.dateObj.getTime() === returnD.getTime());
          if (targetDay) targetDay['Trả sách']++;
        }

        // Count for popular books
        if (data.bookTitle) {
          bookCounts[data.bookTitle] = (bookCounts[data.bookTitle] || 0) + 1;
        }
      });
      
      setStats(prev => ({ ...prev, activeLoans: active, overdueLoans: overdue }));
      setTrendData(trendDays);

      // Process Recent Activity (sort by issueDate)
      const sortedActivity = allBorrowings
        .filter(b => b.issueDate)
        .sort((a, b) => {
          const dateA = a.issueDate.toDate ? a.issueDate.toDate() : new Date(a.issueDate);
          const dateB = b.issueDate.toDate ? b.issueDate.toDate() : new Date(b.issueDate);
          return dateB - dateA;
        })
        .slice(0, 5);
      
      setRecentActivity(sortedActivity);

      // Process Popular Books
      const popular = Object.keys(bookCounts).map(title => ({
        title,
        count: bookCounts[title]
      })).sort((a, b) => b.count - a.count).slice(0, 5);
      
      setPopularBooks(popular);
    });

    return () => {
      unsubBooks();
      unsubMembers();
      unsubBorrowings();
    };
  }, [timeFilter]);

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

  const getInitials = (name) => {
    if (!name) return 'UN';
    return name.substring(0, 2).toUpperCase();
  };

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
              <p className="text-sm text-text-secondary">Lượt mượn vs trả sách</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setTimeFilter('7days')} 
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${timeFilter === '7days' ? 'bg-surfaceHover text-white' : 'text-text-secondary hover:text-white'}`}
              >
                7 Ngày
              </button>
              <button 
                onClick={() => setTimeFilter('30days')} 
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${timeFilter === '30days' ? 'bg-surfaceHover text-white' : 'text-text-secondary hover:text-white'}`}
              >
                30 Ngày
              </button>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMuon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E6B389" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#E6B389" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTra" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6A8B5F" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6A8B5F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#302A24" vertical={false} />
                <XAxis dataKey="name" stroke="#8C7D64" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#8C7D64" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{stroke: '#302A24', strokeWidth: 1}} />
                <Area type="monotone" dataKey="Mượn sách" stroke="#E6B389" strokeWidth={2} fillOpacity={1} fill="url(#colorMuon)" />
                <Area type="monotone" dataKey="Trả sách" stroke="#6A8B5F" strokeWidth={2} fillOpacity={1} fill="url(#colorTra)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-surface border border-[#302A24] rounded-2xl p-6 flex flex-col">
          <h3 className="text-white font-serif text-lg mb-1">Phân bổ thể loại</h3>
          <p className="text-sm text-text-secondary mb-4">Tỷ lệ theo số lượng sách</p>
          <div className="h-48 w-full flex-1 flex items-center justify-center relative">
            {genreData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {genreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-text-secondary text-sm">Chưa có dữ liệu sách</div>
            )}
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <span className="text-white font-serif text-xl">{stats.totalBooks}</span>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center">
            {genreData.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full min-w-[8px]" style={{backgroundColor: COLORS[i % COLORS.length]}}></span>
                <span className="text-text-secondary truncate max-w-[80px]" title={entry.name}>{entry.name}</span>
                <span className="text-white font-medium ml-1">{Math.round((entry.value / stats.totalBooks) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-surface border border-[#302A24] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-white font-serif text-lg">Hoạt động gần đây</h3>
              <p className="text-sm text-text-secondary">Các sự kiện mượn trả mới nhất</p>
            </div>
            <button 
              onClick={handleExportActivity}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#302A24] text-white hover:bg-surfaceHover transition-colors flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Xuất
            </button>
          </div>
          
          {recentActivity.length === 0 ? (
            <div className="text-center text-text-secondary py-10">Chưa có hoạt động nào</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-text-secondary text-xs uppercase font-semibold tracking-wider">
                  <tr>
                    <th className="pb-4 font-medium">Thành viên</th>
                    <th className="pb-4 font-medium">Hành động</th>
                    <th className="pb-4 font-medium">Sách</th>
                    <th className="pb-4 font-medium text-right">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#302A24]">
                  {recentActivity.map((activity, idx) => {
                    const date = activity.issueDate.toDate ? activity.issueDate.toDate() : new Date(activity.issueDate);
                    return (
                      <tr key={idx} className="group">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                              {getInitials(activity.memberName)}
                            </div>
                            <span className="text-white font-medium">{activity.memberName || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-1 text-[10px] rounded bg-[#5F85A1]/20 text-[#5F85A1] font-bold uppercase border border-[#5F85A1]/20">
                            Đã mượn
                          </span>
                        </td>
                        <td className="py-3 text-white font-medium">{activity.bookTitle}</td>
                        <td className="py-3 text-right text-text-secondary text-xs">
                          {formatDistanceToNow(date, { addSuffix: true, locale: vi })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
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
      </div>
    </div>
  );
}
