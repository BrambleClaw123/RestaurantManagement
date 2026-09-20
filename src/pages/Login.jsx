import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Danh sách tài khoản giả lập (lấy từ dữ liệu mẫu của trang Admin)
const MOCK_ACCOUNTS = [
  { username: 'admin', password: 'admin', role: 'Admin', path: '/admin' },
  { username: 'letan_maia', password: 'password123', role: 'Lễ tân', path: '/reception' },
  { username: 'quanly_quan', password: 'manager@2026', role: 'Quản lý', path: '/manager' },
  { username: 'chefbep_hung', password: 'kitchen2026', role: 'Bếp', path: '/kitchen' },
  { username: 'kho_tuan', password: 'stockroom@pass', role: 'Thủ kho', path: '/warehouse' },
  { username: 'phucvu_thao', password: 'service_thao', role: 'Phục vụ', path: '/waiter' }
];

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError(''); // Xóa lỗi cũ nếu có

    // Kiểm tra tài khoản và mật khẩu
    const account = MOCK_ACCOUNTS.find(
      acc => acc.username === username && acc.password === password
    );

    if (account) {
      // (Tùy chọn) Lưu thông tin user vào localStorage để các trang khác biết ai đang đăng nhập
      localStorage.setItem('nexus_user', JSON.stringify(account));
      
      // Chuyển hướng đến đúng trang của chức vụ
      navigate(account.path);
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không chính xác!');
    }
  };

  // Hàm tiện ích để click vào gợi ý là tự động điền form
  const fillCredentials = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen font-sans text-slate-800 relative flex flex-col justify-between overflow-x-hidden bg-slate-50">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-pattern opacity-60"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[360px] bg-blue-100/60 blur-3xl rounded-full pointer-events-none z-0"></div>

      {/* Header */}
      <header className="relative z-10 w-full px-6 py-6 sm:px-10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">NexusCore</span>
            <span className="text-xs text-slate-500 tracking-wider uppercase font-semibold">Enterprise System</span>
          </div>
        </div>
        <div className="text-sm">
          <span className="text-slate-500 hidden sm:inline">Cần hỗ trợ?</span>
          <a className="font-medium text-blue-600 hover:text-blue-700 transition ml-1" href="#">Bộ phận IT</a>
        </div>
      </header>

      {/* Main Login Area */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/50 p-8 sm:p-10 transition-all z-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-2">Đăng nhập</h1>
            <p className="text-sm text-slate-500">Truy cập vào không gian làm việc và dữ liệu hệ thống</p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="username">
                Tên đăng nhập
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <input 
                  id="username" 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập..." 
                  required 
                  className="block w-full rounded-lg border border-slate-300 bg-slate-50/50 pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-sm transition-all" 
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-700" htmlFor="password">
                  Mật khẩu
                </label>
              </div>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required 
                  className="block w-full rounded-lg border border-slate-300 bg-slate-50/50 pl-10 pr-11 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-sm transition-all" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-blue-600 focus:outline-none transition">
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path></svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Hiển thị lỗi nếu có */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-sm font-medium flex items-center gap-2 animate-in fade-in duration-200">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                {error}
              </div>
            )}

            <div className="pt-2">
              <button className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md transition-all active:scale-[0.98]" type="submit">
                Truy cập hệ thống
                <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Khung Cheat Sheet hỗ trợ Developer test nhanh */}
        <div className="mt-8 w-full max-w-2xl bg-slate-100/80 backdrop-blur border border-slate-200 rounded-xl p-4 z-10">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Gợi ý tài khoản kiểm thử (Bấm để điền nhanh)</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {MOCK_ACCOUNTS.map((acc, idx) => (
              <button 
                key={idx} 
                onClick={() => fillCredentials(acc.username, acc.password)}
                className="text-left p-2 rounded border border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm transition-all"
                type="button"
              >
                <div className="text-xs font-bold text-blue-700">{acc.role}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{acc.username}</div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-5 px-6 text-center text-xs text-slate-500 border-t border-slate-200/50 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 NexusCore Systems. Tất cả quyền được bảo lưu.</p>
          <div className="flex space-x-6">
            <a className="hover:text-slate-800 transition" href="#">Điều khoản bảo mật</a>
            <a className="hover:text-slate-800 transition" href="#">Quy chế hệ thống</a>
          </div>
        </div>
      </footer>
    </div>
  );
}