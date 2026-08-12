import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function RecentActivity({ recentActivity, handleExportActivity }) {
  const getInitials = (name) => {
    if (!name) return 'UN';
    return name.substring(0, 2).toUpperCase();
  };

  return (
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
                const date = activity.issueDate?.toDate ? activity.issueDate.toDate() : new Date(activity.issueDate);
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
                      {activity.status === 'Đã trả' ? (
                        <span className="px-2 py-1 text-[10px] rounded bg-status-active/20 text-status-active font-bold uppercase border border-status-active/20">
                          Đã trả
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-[10px] rounded bg-[#5F85A1]/20 text-[#5F85A1] font-bold uppercase border border-[#5F85A1]/20">
                          Đã mượn
                        </span>
                      )}
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
  );
}
