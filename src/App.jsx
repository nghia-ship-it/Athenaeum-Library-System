import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import BookCatalog from './pages/BookCatalog';
import Members from './pages/Members';
import Borrowing from './pages/Borrowing';
import Reservations from './pages/Reservations';
import Fines from './pages/Fines';
import Reports from './pages/Reports';
import Branches from './pages/Branches';
import Settings from './pages/Settings';
import Admins from './pages/Admins';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import MemberLayout from './components/MemberLayout';
import MemberPortal from './pages/MemberPortal';
import MemberRegistration from './pages/MemberRegistration';
import Guide from './pages/Guide';
import About from './pages/About';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Member Routes */}
          <Route path="/" element={<Navigate to="/about" replace />} />
          <Route path="/about" element={<About />} />
          <Route element={<MemberLayout />}>
            <Route path="/portal" element={<MemberPortal />} />
            <Route path="/register" element={<MemberRegistration />} />
            <Route path="/guide" element={<Guide />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/login" element={<Login />} />
          
          <Route path="/admin" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="books" element={<BookCatalog />} />
            <Route path="members" element={<Members />} />
            <Route path="borrowing" element={<Borrowing />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="fines" element={<Fines />} />
            <Route path="reports" element={<Reports />} />
            <Route path="admins" element={<Admins />} />
            <Route path="branches" element={<Branches />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<div className="text-white text-center mt-20">Trang đang được xây dựng hoặc không tồn tại.</div>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
