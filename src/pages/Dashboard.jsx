import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { format, subDays, startOfDay } from 'date-fns';
import DashboardCharts from '../components/features/Dashboard/DashboardCharts';
import RecentActivity from '../components/features/Dashboard/RecentActivity';
import PopularBooks from '../components/features/Dashboard/PopularBooks';

export default function Dashboard() {
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

  return (
    <div>
      <DashboardCharts 
        trendData={trendData} 
        genreData={genreData} 
        timeFilter={timeFilter} 
        setTimeFilter={setTimeFilter} 
        stats={stats} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <RecentActivity 
          recentActivity={recentActivity} 
          handleExportActivity={handleExportActivity} 
        />
        <PopularBooks 
          popularBooks={popularBooks} 
        />
      </div>
    </div>
  );
}
