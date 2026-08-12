import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Book } from 'lucide-react';

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const { login, signup, loginWithGoogle, loginWithGitHub, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      let errorMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      if (err.code === 'auth/wrong-password') errorMessage = 'Sai mật khẩu.';
      else if (err.code === 'auth/user-not-found') errorMessage = 'Không tìm thấy tài khoản với email này.';
      else if (err.code === 'auth/email-already-in-use') errorMessage = 'Email này đã được sử dụng.';
      else if (err.code === 'auth/weak-password') errorMessage = 'Mật khẩu quá yếu, vui lòng chọn mật khẩu từ 6 ký tự.';
      else if (err.code === 'auth/invalid-credential') errorMessage = 'Thông tin đăng nhập không chính xác.';
      setError(errorMessage);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      let errorMessage = 'Lỗi đăng nhập Google: ' + err.message;
      if (err.code === 'auth/configuration-not-found') {
        errorMessage = 'Tính năng đăng nhập Google chưa được bật. Vui lòng vào Firebase Console -> Authentication -> Sign-in method để bật Google provider.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Bạn đã đóng cửa sổ đăng nhập Google.';
      }
      setError(errorMessage);
    }
    setLoading(false);
  };

  const handleGitHubSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGitHub();
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      let errorMessage = 'Lỗi đăng nhập GitHub: ' + err.message;
      if (err.code === 'auth/configuration-not-found') {
        errorMessage = 'Tính năng đăng nhập GitHub chưa được cấu hình. Vui lòng thêm Client ID và Secret trong Firebase Console.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Bạn đã đóng cửa sổ đăng nhập GitHub.';
      }
      setError(errorMessage);
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Vui lòng nhập email để khôi phục mật khẩu.');
      return;
    }
    try {
      setError('');
      setMsg('');
      setLoading(true);
      await resetPassword(email);
      setMsg('Đã gửi email khôi phục mật khẩu. Vui lòng kiểm tra hộp thư của bạn.');
    } catch (err) {
      console.error(err);
      setError('Lỗi khi gửi email khôi phục: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans relative">
      <Link to="/portal" className="absolute top-6 left-6 md:top-8 md:left-8 z-50 flex items-center gap-2 text-text-secondary hover:text-primary transition-colors font-medium">
        <Book size={18} />
        <span className="text-sm">Dành cho độc giả</span>
      </Link>

      {/* Left Panel - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-16 lg:p-24 relative z-10">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <img src="/logo.png" alt="Athenaeum Logo" className="w-12 h-12 object-contain rounded" />
            <div>
              <h1 className="font-serif font-bold text-lg leading-tight tracking-wide text-white">ATHENAEUM</h1>
              <p className="text-[10px] uppercase tracking-widest text-text-secondary">Library System</p>
            </div>
          </div>

          <h2 className="text-4xl font-serif font-bold text-white mb-2">
            {isSignup ? 'Tạo tài khoản' : 'Welcome back'}
          </h2>
          <p className="text-text-secondary mb-8">
            {isSignup 
              ? 'Tạo tài khoản thư viện mới của bạn'
              : 'Đăng nhập vào bảng điều khiển thủ thư để quản lý bộ sưu tập'}
          </p>

          {error && <div className="bg-status-overdue/20 text-status-overdue p-3 rounded mb-4 text-sm border border-status-overdue/20">{error}</div>}
          {msg && <div className="bg-status-active/20 text-status-active p-3 rounded mb-4 text-sm border border-status-active/20">{msg}</div>}

          <div className="flex gap-4 mb-6">
            <button 
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded border border-[#302A24] bg-surface flex items-center justify-center gap-2 hover:bg-surfaceHover transition-colors text-sm font-medium text-white"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button 
              type="button"
              onClick={handleGitHubSignIn}
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded border border-[#302A24] bg-surface flex items-center justify-center gap-2 hover:bg-surfaceHover transition-colors text-sm font-medium text-white"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-[#302A24] flex-1"></div>
            <span className="text-text-secondary text-xs">or continue with email</span>
            <div className="h-px bg-[#302A24] flex-1"></div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-[#302A24] text-white text-sm rounded-lg focus:ring-primary focus:border-primary block pl-10 p-2.5"
                  placeholder="librarian@athenaeum.org"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-[#302A24] text-white text-sm rounded-lg focus:ring-primary focus:border-primary block pl-10 p-2.5"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {!isSignup && (
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <input id="remember" type="checkbox" className="w-4 h-4 text-primary bg-background border-[#302A24] rounded focus:ring-primary focus:ring-2" />
                  <label htmlFor="remember" className="ml-2 text-sm font-medium text-text-secondary">Remember me</label>
                </div>
                <button type="button" onClick={handleForgotPassword} disabled={loading} className="text-sm font-medium text-primary hover:underline bg-transparent border-none p-0 cursor-pointer disabled:opacity-50">Forgot password?</button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-background bg-primary hover:bg-primaryHover focus:ring-4 focus:ring-primary/50 font-medium rounded-lg text-sm px-5 py-3 text-center transition-colors"
            >
              {isSignup ? 'Tạo tài khoản' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-text-secondary">
            {isSignup ? 'Đã có tài khoản? ' : 'New staff member? '}
            <button 
              onClick={() => setIsSignup(!isSignup)} 
              className="font-medium text-primary hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              {isSignup ? 'Đăng nhập' : 'Create an account'}
            </button>
          </p>

          <div className="mt-8 text-center text-xs text-text-secondary/60">
            Demo — use any valid email and a 6+ character password
          </div>
        </div>
      </div>

      {/* Right Panel - Gradient Background */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#EAB159] to-[#C88A31] p-12 lg:p-24 flex-col justify-center items-center text-center">
        {/* Decorative circle */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
        
        <div className="relative z-10 max-w-md mx-auto flex flex-col items-center">
          <div className="bg-black/10 text-[#543414] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-8 flex items-center gap-2">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            ATHENAEUM
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-[#3E250E] mb-6 leading-tight">
            {isSignup ? 'Welcome back?' : 'New to the staff?'}
          </h2>
          <p className="text-[#5E3A18] text-lg mb-10">
            {isSignup 
              ? 'Đăng nhập vào hệ thống để tiếp tục công việc quản lý thư viện của bạn.'
              : 'Create your librarian account and start curating the collection in minutes.'}
          </p>
          
          <button 
            onClick={() => setIsSignup(!isSignup)}
            className="px-8 py-3 rounded-full border border-[#5E3A18] text-[#3E250E] font-medium hover:bg-black/5 transition-colors"
          >
            {isSignup ? 'Đăng nhập' : 'Create account'}
          </button>

          <div className="mt-20">
            <p className="font-serif italic text-[#5E3A18] opacity-80 max-w-sm mx-auto text-sm">
              "A university is just a group of buildings gathered around a library."<br/>
              — Foote
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
