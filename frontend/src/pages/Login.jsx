import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Gọi API gửi username và password xuống Backend
      const data = await api.post('/api/auth/login', {
        tenDangNhap: username,
        matKhau: password
      });

      // 2. Nhận Token từ Backend và lưu vào máy
      localStorage.setItem('token', data.token);

      // (Tùy chọn) Lưu thông tin user để hiển thị tên lên góc phải màn hình
      localStorage.setItem('nexus_user', JSON.stringify({
        hoTen: data.hoTen,
        vaiTro: data.vaiTro
      }));

      // Nếu có cờ yêu cầu đổi mật khẩu, bắt buộc chuyển sang trang đổi mật khẩu
      if (data.yeuCauDoiMatKhau) {
        return navigate('/doi-mat-khau-lan-dau', { state: { maNV: data.maNV } });
      }

      // 3. Phân luồng chuyển màn hình dựa vào Chức vụ (vaiTro)
      switch (data.vaiTro) {
        case 'ADMIN': return navigate('/admin');
        case 'QUAN_LY': return navigate('/manager');
        case 'LE_TAN': return navigate('/reception');
        case 'DAU_BEP': return navigate('/kitchen');
        case 'NHAN_VIEN_KHO': return navigate('/warehouse');
        case 'PHUC_VU': return navigate('/waiter');
        default: return navigate('/waiter');
      }

    } catch (err) {
      // 4. Bắt thông báo lỗi từ Backend
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-800 relative flex flex-col justify-between overflow-x-hidden bg-slate-50">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-pattern opacity-60"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[360px] bg-blue-100/60 blur-3xl rounded-full pointer-events-none z-0"></div>

      {/* Main Login Area */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/50 p-8 sm:p-10 transition-all z-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-2">Đăng nhập</h1>
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


      </main>
    </div>
  );
}