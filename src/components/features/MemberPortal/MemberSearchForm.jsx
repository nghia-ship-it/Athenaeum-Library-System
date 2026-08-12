import React from 'react';
import { Search } from 'lucide-react';

export default function MemberSearchForm({ email, setEmail, handleSearch, loadingSearch, errorMsg }) {
  return (
    <section className="bg-surface border border-[#302A24] rounded-2xl p-8 shadow-xl max-w-2xl mx-auto relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50"></div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif font-bold text-white mb-2">Tra cứu thẻ thư viện</h2>
        <p className="text-text-secondary text-sm">Nhập email đã đăng ký của bạn để kiểm tra sách đang mượn và các khoản phạt.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
          <input 
            type="email" 
            placeholder="VD: email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-background border border-[#302A24] rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50"
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loadingSearch}
          className="bg-primary text-background px-6 py-3 rounded-xl font-bold hover:bg-primaryHover transition-colors disabled:opacity-50"
        >
          {loadingSearch ? 'Đang tìm...' : 'Tra cứu'}
        </button>
      </form>

      {errorMsg && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
          {errorMsg}
        </div>
      )}
    </section>
  );
}
