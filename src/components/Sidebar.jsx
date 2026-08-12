import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Book, Users, ArrowRightLeft, Bookmark, CircleDollarSign, BarChart2, Building, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navGroups = [
  {
    title: 'CHÍNH',
    items: [
      { name: 'Tổng quan', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Sách', path: '/admin/books', icon: Book, badgeKey: 'books' },
      { name: 'Thành viên', path: '/admin/members', icon: Users },
    ],
  },
  {
    title: 'LUÂN CHUYỂN',
    items: [
      { name: 'Mượn trả', path: '/admin/borrowing', icon: ArrowRightLeft, badgeKey: 'borrowing' },
      { name: 'Đặt trước', path: '/admin/reservations', icon: Bookmark },
      { name: 'Phạt', path: '/admin/fines', icon: CircleDollarSign, badgeKey: 'fines' },
    ],
  },
  {
    title: 'QUẢN TRỊ',
    items: [
      { name: 'Báo cáo', path: '/admin/reports', icon: BarChart2 },
      { name: 'Tài khoản', path: '/admin/admins', icon: Users, role: 'superadmin' },
      { name: 'Chi nhánh', path: '/admin/branches', icon: Building },
      { name: 'Cài đặt', path: '/admin/settings', icon: Settings },
    ],
  }
];
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function Sidebar() {
  const navigate = useNavigate();
  const { currentUser, userData, logout } = useAuth();
  const [badges, setBadges] = useState({
    books: 0,
    borrowing: 0,
    fines: 0
  });

  React.useEffect(() => {
    // Books count
    const unsubBooks = onSnapshot(collection(db, 'books'), (snapshot) => {
      setBadges(prev => ({ ...prev, books: snapshot.size }));
    });

    // Active borrowings count
    const unsubBorrowings = onSnapshot(collection(db, 'borrowings'), (snapshot) => {
      let active = 0;
      snapshot.forEach(doc => {
        const status = doc.data().status;
        if (status === 'Đang mượn' || status === 'Quá hạn') active++;
      });
      setBadges(prev => ({ ...prev, borrowing: active }));
    });

    // Unpaid fines count
    const unsubFines = onSnapshot(collection(db, 'fines'), (snapshot) => {
      let unpaid = 0;
      snapshot.forEach(doc => {
        if (doc.data().status === 'Chưa thanh toán') unpaid++;
      });
      setBadges(prev => ({ ...prev, fines: unpaid }));
    });

    return () => {
      unsubBooks();
      unsubBorrowings();
      unsubFines();
    };
  }, []);

  const handleLogout = async (e) => {
    if (e) e.stopPropagation();
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  const getInitials = (email) => {
    if (!email) return 'EV';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="w-64 border-r border-[#302A24] flex flex-col h-full bg-background/95 backdrop-blur-sm z-10">
      <div className="p-6 flex items-center gap-3">
        <img src="/logo.png" alt="Athenaeum Logo" className="w-10 h-10 object-contain rounded" />
        <div>
          <h1 className="font-serif text-lg leading-tight tracking-wide font-bold">ATHENAEUM</h1>
          <p className="text-[10px] tracking-widest text-text-secondary uppercase">Hệ thống thư viện</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 scrollbar-hide">
        {navGroups.map((group, index) => {
          const visibleItems = group.items.filter(item => {
            if (item.role === 'superadmin' && userData?.role !== 'superadmin') {
              return false;
            }
            return true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={index}>
              <h3 className="text-xs font-semibold text-text-secondary tracking-wider mb-3 px-2 uppercase">{group.title}</h3>
              <ul className="space-y-1">
                {visibleItems.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 text-sm font-medium ${
                          isActive ? 'bg-surface text-primary' : 'text-text-primary hover:bg-surfaceHover'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon size={18} className={isActive ? 'text-primary' : 'text-text-secondary'} />
                          <span className="flex-1 text-left">{item.name}</span>
                          {item.badgeKey && badges[item.badgeKey] > 0 && (
                            <span className="bg-primary/20 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                              {badges[item.badgeKey]}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="p-4 mt-auto">
        <div onClick={() => navigate('/admin/settings')} className="bg-surface rounded-2xl p-3 flex items-center gap-3 border border-[#302A24] hover:bg-surfaceHover cursor-pointer transition-colors">
          <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
            {getInitials(currentUser?.email)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-white">
              {currentUser?.email ? currentUser.email.split('@')[0] : 'Eleanor Vance'}
            </p>
            <p className="text-xs text-text-secondary truncate">Trưởng thư viện</p>
          </div>
          <button onClick={handleLogout} className="text-text-secondary hover:text-white p-1 rounded-lg" title="Đăng xuất">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
