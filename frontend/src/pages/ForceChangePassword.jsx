import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api';

export default function ForceChangePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const maNV = location.state?.maNV;

  if (!maNV) {
    // Nếu truy cập trực tiếp không có maNV, văng ra ngoài đăng nhập
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="p-8 bg-white rounded-xl shadow text-center">
          <p className="text-rose-600 font-bold mb-4">Truy cập không hợp lệ.</p>
          <button onClick={() => navigate('/login')} className="px-4 py-2 bg-blue-600 text-white rounded font-bold">Quay lại Đăng nhập</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp!');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await api.put('/api/auth/doi-mat-khau-lan-dau', { maNV, matKhauMoi: password });
      
      // Xóa thông tin cũ
      localStorage.removeItem('token');
      localStorage.removeItem('nexus_user');
      
      alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi đổi mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-800 relative flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/50 p-8 sm:p-10 z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Đổi Mật Khẩu Bắt Buộc</h1>
          <p className="text-sm text-slate-500">Tài khoản của bạn đã được quản trị viên đặt lại mật khẩu ngẫu nhiên. Vui lòng thiết lập mật khẩu cá nhân mới để tiếp tục sử dụng hệ thống.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu mới</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full rounded-lg border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nhập lại mật khẩu mới</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="block w-full rounded-lg border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-sm transition-all"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-sm font-medium flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              {error}
            </div>
          )}

          <div className="pt-2">
            <button disabled={isLoading} className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md transition-all disabled:opacity-50" type="submit">
              {isLoading ? 'Đang xử lý...' : 'Xác nhận và Đổi mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
