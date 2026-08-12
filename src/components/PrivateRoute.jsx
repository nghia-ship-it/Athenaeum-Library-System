import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { currentUser, userData, logout } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (userData?.status === 'pending' || userData?.status === 'rejected') {
    const isRejected = userData?.status === 'rejected';
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-surface border border-[#302A24] rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <div className="w-16 h-16 bg-[#302A24] text-text-secondary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
            {isRejected ? '❌' : '⏳'}
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mb-2">
            {isRejected ? 'Tài khoản bị từ chối' : 'Đang chờ phê duyệt'}
          </h2>
          <p className="text-text-secondary text-sm mb-8">
            {isRejected 
              ? 'Yêu cầu cấp quyền quản trị của bạn đã bị từ chối. Vui lòng liên hệ Superadmin để biết thêm chi tiết.'
              : 'Tài khoản của bạn đã được tạo nhưng đang chờ Superadmin phê duyệt trước khi có thể truy cập hệ thống Quản trị. Vui lòng quay lại sau.'}
          </p>
          <button 
            onClick={logout}
            className="w-full bg-primary text-background py-3 rounded-xl font-bold hover:bg-primaryHover transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  return children;
}
