import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Book, Users, ArrowRightLeft, Bookmark, CircleDollarSign, BarChart2, Building, Settings, LogOut } from 'lucide-react';

const navGroups = [
  {
    title: 'CHÍNH',
    items: [
      { name: 'Tổng quan', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Sách', path: '/books', icon: Book, badge: 18 },
      { name: 'Thành viên', path: '/members', icon: Users },
    ],
  },
  {
    title: 'LUÂN CHUYỂN',
    items: [
      { name: 'Mượn trả', path: '/borrowing', icon: ArrowRightLeft, badge: 3 },
      { name: 'Đặt trước', path: '/reservations', icon: Bookmark },
      { name: 'Phạt', path: '/fines', icon: CircleDollarSign, badge: 2 },
    ],
  },
  {
    title: 'QUẢN TRỊ',
    items: [
      { name: 'Báo cáo', path: '/reports', icon: BarChart2 },
      { name: 'Chi nhánh', path: '/branches', icon: Building },
      { name: 'Cài đặt', path: '/settings', icon: Settings },
    ],
  }
];

export default function Sidebar() {
  return (
    <div className="w-64 border-r border-[#302A24] flex flex-col h-full bg-background/95 backdrop-blur-sm z-10">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-primary text-background flex items-center justify-center font-serif font-bold text-lg">
          <Book size={18} />
        </div>
        <div>
          <h1 className="font-serif text-lg leading-tight tracking-wide font-bold">ATHENAEUM</h1>
          <p className="text-[10px] tracking-widest text-text-secondary uppercase">Hệ thống thư viện</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 scrollbar-hide">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="text-xs font-semibold text-text-secondary tracking-wider mb-3 px-2 uppercase">{group.title}</h3>
            <ul className="space-y-1">
              {group.items.map((item, itemIdx) => (
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
                        {item.badge && (
                          <span className="bg-primary/20 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="p-4 mt-auto">
        <div className="bg-surface rounded-2xl p-3 flex items-center gap-3 border border-[#302A24] hover:bg-surfaceHover cursor-pointer transition-colors">
          <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
            EV
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-white">Eleanor Vance</p>
            <p className="text-xs text-text-secondary truncate">Trưởng thư viện</p>
          </div>
          <button className="text-text-secondary hover:text-white p-1 rounded-lg">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
