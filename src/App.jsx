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

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/books" element={<BookCatalog />} />
          <Route path="/members" element={<Members />} />
          <Route path="/borrowing" element={<Borrowing />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/fines" element={<Fines />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<div className="text-white text-center mt-20">Trang đang được xây dựng hoặc không tồn tại.</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
