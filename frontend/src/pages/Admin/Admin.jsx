import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { api } from '../../utils/api';

export default function Admin() {
  // GLOBAL STATES
  const [activeTab, setActiveTab] = useState('accounts');
  const [toast, setToast] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // DATA STATES
  const [employees, setEmployees] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // ACCOUNTS TAB STATES
  const [accSearch, setAccSearch] = useState('');
  const [accStatusFilter, setAccStatusFilter] = useState('ALL');
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [accForm, setAccForm] = useState({ maNV: '', username: '', status: 1 });

  // EMPLOYEES TAB STATES
  const [empSearch, setEmpSearch] = useState('');
  const [empRoleFilter, setEmpRoleFilter] = useState('ALL');
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [empForm, setEmpForm] = useState({ maNV: '', name: '', role: 'PHUC_VU', phone: '' });

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // --- FETCH DATA TỪ BACKEND ---
  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const emps = await api.get('/api/nhan-vien');
      const accs = await api.get('/api/tai-khoan');
      setEmployees(emps);
      setAccounts(accs);
    } catch (err) {
      showToast("Lỗi tải dữ liệu: " + err.message);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HELPERS ---
  const getRoleBadge = (role) => {
    const roleMap = {
      'QUAN_LY': 'Người quản lý',
      'LE_TAN': 'Lễ tân',
      'DAU_BEP': 'Đầu bếp',
      'NHAN_VIEN_KHO': 'Nhân viên kho',
      'PHUC_VU': 'Nhân viên phục vụ',
      'ADMIN': 'Người quản trị'
    };
    const label = roleMap[role] || role;

    switch (role) {
      case 'QUAN_LY': return <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">{label}</span>;
      case 'LE_TAN': return <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">{label}</span>;
      case 'DAU_BEP': return <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">{label}</span>;
      case 'NHAN_VIEN_KHO': return <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">{label}</span>;
      case 'PHUC_VU': return <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">{label}</span>;
      case 'ADMIN': return <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">{label}</span>;
      default: return <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">{label}</span>;
    }
  };

  // --- ACCOUNTS LOGIC ---
  const filteredAccounts = accounts.filter(acc => {
    const emp = employees.find(e => e.maNV === acc.maNV);
    const empName = emp ? emp.hoTen.toLowerCase() : '';
    const empRole = emp ? emp.vaiTro.toLowerCase() : '';
    const matchSearch = acc.tenDangNhap.toLowerCase().includes(accSearch.toLowerCase()) || empName.includes(accSearch.toLowerCase()) || empRole.includes(accSearch.toLowerCase());
    const matchStatus = accStatusFilter === 'ALL' ||
      (accStatusFilter === 'ACTIVE' && acc.trangThai === 1) ||
      (accStatusFilter === 'LOCKED' && acc.trangThai === 0);
    return matchSearch && matchStatus;
  });


  const handleResetPassword = async (maNV, tenDangNhap) => {
    if (!window.confirm(`Bạn có chắc chắn muốn đặt lại mật khẩu ngẫu nhiên cho tài khoản "${tenDangNhap}" không?`)) return;
    try {
      const res = await api.put(`/api/tai-khoan/${maNV}/reset-password`);
      alert(`ĐẶT LẠI MẬT KHẨU THÀNH CÔNG!\n\nTài khoản: ${tenDangNhap}\nMật khẩu mới: ${res.matKhauMoi}\n\nVui lòng copy gửi cho nhân viên. Họ sẽ bị yêu cầu đổi lại mật khẩu trong lần đăng nhập tới.`);
      fetchData();
    } catch (err) {
      showToast("Lỗi: " + err.message);
    }
  };

  const handleLockAccount = async (maNV) => {
    try {
      await api.put(`/api/tai-khoan/${maNV}/trang-thai`);
      showToast("Đã thay đổi trạng thái tài khoản thành công!");
      fetchData();
    } catch (err) {
      showToast("Lỗi: " + err.message);
    }
  };

  const openAccModal = (acc = null) => {
    if (acc) {
      setAccForm({ maNV: acc.maNV, username: acc.tenDangNhap, status: acc.trangThai });
    } else {
      setAccForm({ maNV: '', username: '', status: 1 });
    }
    setIsAccModalOpen(true);
  };

  const handleAccSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        tenDangNhap: accForm.username,
        maNV: accForm.maNV,
        trangThai: accForm.status
      };
      
      const isEdit = accounts.some(a => a.maNV === accForm.maNV);

      if (isEdit) {
        await api.put(`/api/tai-khoan/${accForm.maNV}`, payload);
        showToast(`Đã cập nhật tài khoản ${accForm.username} thành công!`);
      } else {
        const res = await api.post('/api/tai-khoan', payload);
        alert(`TẠO TÀI KHOẢN THÀNH CÔNG!\n\nTài khoản: ${res.taiKhoan.tenDangNhap}\nMật khẩu khởi tạo: ${res.matKhauMoi}\n\nVui lòng copy và gửi thông tin này cho nhân viên.`);
        showToast(`Đã tạo tài khoản ${accForm.username} thành công!`);
      }
      setIsAccModalOpen(false);
      fetchData();
    } catch (err) {
      showToast("Lỗi: " + err.message);
    }
  };

  // --- EMPLOYEES LOGIC ---
  const filteredEmployees = employees.filter(emp => {
    const matchSearch = emp.hoTen.toLowerCase().includes(empSearch.toLowerCase()) ||
      (emp.soDienThoai && emp.soDienThoai.includes(empSearch)) ||
      emp.vaiTro.toLowerCase().includes(empSearch.toLowerCase());
    const matchRole = empRoleFilter === 'ALL' || emp.vaiTro === empRoleFilter;
    return matchSearch && matchRole;
  });

  const assignedCount = employees.filter(e => accounts.some(a => a.maNV === e.maNV)).length;

  const openEmpModal = (emp = null) => {
    if (emp) setEmpForm({ maNV: emp.maNV, name: emp.hoTen, role: emp.vaiTro, phone: emp.soDienThoai });
    else setEmpForm({ maNV: '', name: '', role: 'PHUC_VU', phone: '' });
    setIsEmpModalOpen(true);
  };

  const handleEmpSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        hoTen: empForm.name,
        vaiTro: empForm.role,
        soDienThoai: empForm.phone
      };
      if (empForm.maNV) {
        await api.put(`/api/nhan-vien/${empForm.maNV}`, payload);
        showToast(`Đã cập nhật thông tin nhân viên "${empForm.name}"!`);
      } else {
        await api.post('/api/nhan-vien', payload);
        showToast(`Đã thêm nhân viên "${empForm.name}" thành công!`);
      }
      setIsEmpModalOpen(false);
      fetchData();
    } catch (err) {
      showToast("Lỗi: " + err.message);
    }
  };

  // --- CẤU HÌNH LAYOUT DÙNG CHUNG ---
  const topbarProps = {
    title: "System Admin",
    tagText: "Trực Tuyến",
    userInfo: { name: "Admin Root", role: "Quản Trị Viên Hệ Thống", initials: "AD" },
    icon: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
  };

  const sidebarProps = {
    branchName: "CHI NHÁNH TRUNG TÂM",
    activeTab,
    setActiveTab,
    userInfo: { name: "Quản Trị Hệ Thống", role: "Root Administrator", initials: "AD" },
    navItems: [
      {
        id: 'accounts',
        label: 'Tài khoản',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
      },
      {
        id: 'employees',
        label: 'Nhân viên',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
      }
    ]
  };

  return (
    <MainLayout topbarProps={topbarProps} sidebarProps={sidebarProps}>

      {/* TAB 1: ACCOUNTS */}
      {activeTab === 'accounts' && (
        <div className="w-full min-w-0 flex flex-col space-y-6 pb-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản Lý Danh Sách Tài Khoản</h1>
                {isLoadingData && <span className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full"><div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>Đang tải...</span>}
              </div>
              <p className="text-sm text-slate-500 mt-1">Theo dõi, cấp mới và phân quyền tài khoản truy cập tương ứng cho nhân viên trong hệ thống.</p>
            </div>
            <div className="flex items-center">
              <button onClick={() => openAccModal()} className="inline-flex items-center justify-center sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg> Thêm Tài Khoản
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">TỔNG TÀI KHOẢN</div>
                <div className="text-3xl font-extrabold text-slate-900 mt-1">{accounts.length}</div>
                <div className="text-xs text-slate-500 mt-0.5">Tài khoản trên hệ thống</div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">CÒN HOẠT ĐỘNG</div>
                <div className="text-3xl font-extrabold text-emerald-600 mt-1">{accounts.filter(a => a.trangThai === 1).length}</div>
                <div className="text-xs text-slate-500 mt-0.5">Sẵn sàng đăng nhập</div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input value={accSearch} onChange={e => setAccSearch(e.target.value)} type="text" placeholder="Tìm nhanh tên đăng nhập, nhân viên hoặc vai trò..." className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
            </div>
            <div className="w-48">
              <select value={accStatusFilter} onChange={e => setAccStatusFilter(e.target.value)} className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Còn hoạt động</option>
                <option value="LOCKED">Khóa</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col shrink-0 min-w-0">
            <div className="overflow-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="sticky top-0 bg-slate-100 z-10 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="py-3.5 px-6">TÊN ĐĂNG NHẬP</th>
                    <th className="py-3.5 px-6">MÃ NHÂN VIÊN</th>
                    <th className="py-3.5 px-6">HỌ VÀ TÊN NHÂN VIÊN</th>
                    <th className="py-3.5 px-6">VAI TRÒ</th>
                    <th className="py-3.5 px-6 text-center">TRẠNG THÁI</th>
                    <th className="py-3.5 px-6 text-right">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {filteredAccounts.map(acc => {
                    const emp = employees.find(e => e.maNV === acc.maNV) || { hoTen: acc.hoTenNhanVien || 'Không xác định', vaiTro: acc.vaiTro || 'Không xác định' };
                    return (
                      <tr key={acc.maNV} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-6 font-bold text-slate-900">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs uppercase">{acc.tenDangNhap.substring(0, 2)}</div>
                            <span className="font-mono text-sm">{acc.tenDangNhap}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-6 font-mono text-sm font-bold text-blue-700">{acc.maNV}</td>
                        <td className="py-3.5 px-6 font-semibold text-slate-800">{emp.hoTen}</td>
                        <td className="py-3.5 px-6">{getRoleBadge(emp.vaiTro)}</td>
                        <td className="py-3.5 px-6 text-center">
                          {acc.trangThai === 1 ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>Còn hoạt động</span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>Khóa</span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button onClick={() => handleResetPassword(acc.maNV, acc.tenDangNhap)} className="inline-flex items-center px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all shadow-sm">
                              <svg className="w-3.5 h-3.5 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Đặt lại MK
                            </button>
                            <button onClick={() => handleLockAccount(acc.maNV)} className={`inline-flex items-center px-2.5 py-1.5 rounded-lg border ${acc.trangThai === 1 ? 'border-amber-200 text-amber-700 bg-amber-50/50 hover:bg-amber-100' : 'border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100'} text-xs font-bold transition-all`}>
                              {acc.trangThai === 1 ? 'Khóa' : 'Mở khóa'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredAccounts.length === 0 && <tr><td colSpan="6" className="py-12 text-center text-slate-400 font-medium">Không tìm thấy tài khoản phù hợp</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EMPLOYEES */}
      {activeTab === 'employees' && (
        <div className="flex-1 min-w-0 flex flex-col space-y-6 animate-in fade-in duration-200 h-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản Lý Danh Sách Nhân Viên</h1>
                {isLoadingData && <span className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full"><div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>Đang tải...</span>}
              </div>
              <p className="text-sm text-slate-500 mt-1">Thông tin hồ sơ nhân sự, phân loại vai trò chuyên môn và số điện thoại liên lạc.</p>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={() => openEmpModal()} className="inline-flex items-center justify-center sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg> Thêm Mới Nhân Viên
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div><div className="text-xs font-bold uppercase tracking-wider text-slate-400">TỔNG NHÂN SỰ</div><div className="text-3xl font-extrabold text-slate-900 mt-1">{employees.length}</div><div className="text-xs text-slate-500 mt-0.5">Nhân viên đang làm việc</div></div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg></div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div><div className="text-xs font-bold uppercase tracking-wider text-slate-400">ĐÃ CÓ TÀI KHOẢN</div><div className="text-3xl font-extrabold text-emerald-600 mt-1">{assignedCount}</div><div className="text-xs text-slate-500 mt-0.5">Đã được cấp đăng nhập</div></div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg></div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div><div className="text-xs font-bold uppercase tracking-wider text-slate-400">CHƯA CẤP TÀI KHOẢN</div><div className="text-3xl font-extrabold text-amber-600 mt-1">{employees.length - assignedCount}</div><div className="text-xs text-slate-500 mt-0.5">Cần tạo tài khoản</div></div>
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg></div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input value={empSearch} onChange={e => setEmpSearch(e.target.value)} type="text" placeholder="Tìm nhanh theo họ tên, vai trò hoặc số điện thoại..." className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
            <div className="w-56">
              <select value={empRoleFilter} onChange={e => setEmpRoleFilter(e.target.value)} className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="ALL">Tất cả vai trò</option>
                <option value="ADMIN">Người quản trị (Admin)</option>
                <option value="QUAN_LY">Người quản lý</option>
                <option value="LE_TAN">Lễ tân</option>
                <option value="DAU_BEP">Đầu bếp</option>
                <option value="NHAN_VIEN_KHO">Nhân viên kho</option>
                <option value="PHUC_VU">Nhân viên phục vụ</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col shrink-0 min-w-0">
            <div className="overflow-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="sticky top-0 bg-slate-100 z-10 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="py-3.5 px-6">HỌ VÀ TÊN</th>
                    <th className="py-3.5 px-6">VAI TRÒ</th>
                    <th className="py-3.5 px-6 text-center">TÀI KHOẢN LIÊN KẾT</th>
                    <th className="py-3.5 px-6">MÃ NHÂN VIÊN</th>
                    <th className="py-3.5 px-6">SỐ ĐIỆN THOẠI</th>
                    <th className="py-3.5 px-6 text-right">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {filteredEmployees.map(emp => {
                    const acc = accounts.find(a => a.maNV === emp.maNV);
                    return (
                      <tr key={emp.maNV} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-6 font-bold text-slate-900">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs uppercase">
                              {emp.hoTen.split(' ').map(n => n[0]).join('').slice(-2)}
                            </div>
                            <span>{emp.hoTen}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-6">{getRoleBadge(emp.vaiTro)}</td>
                        <td className="py-3.5 px-6 text-center">
                          {acc ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold ${acc.trangThai === 1 ? 'bg-slate-100 text-blue-700' : 'bg-rose-50 text-rose-600'}`}>@{acc.tenDangNhap}</span>
                          ) : (
                            <span className="text-xs text-amber-600 font-medium italic">Chưa cấp tài khoản</span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 font-mono text-sm font-bold text-blue-700">{emp.maNV}</td>
                        <td className="py-3.5 px-6 font-mono text-sm text-slate-600 font-medium">
                          <div className="flex items-center space-x-1.5">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                            <span>{emp.soDienThoai}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <button onClick={() => openEmpModal(emp)} className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-sm">
                            <svg className="w-3.5 h-3.5 mr-1 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg> Sửa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredEmployees.length === 0 && <tr><td colSpan="6" className="py-12 text-center text-slate-400 font-medium">Không tìm thấy nhân viên phù hợp</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* Modal Account */}
      {isAccModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Thêm Mới Tài Khoản</h3>
                <p className="text-xs text-slate-500 font-medium">Chọn nhân viên để tự động liên kết vai trò tương ứng</p>
              </div>
            </div>
            <form onSubmit={handleAccSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Tên Đăng Nhập <span className="text-rose-500">*</span></label>
                <input required type="text" value={accForm.username} onChange={e => setAccForm({ ...accForm, username: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Họ Và Tên Nhân Viên <span className="text-rose-500">*</span></label>
                <select required value={accForm.maNV} onChange={e => setAccForm({ ...accForm, maNV: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="" disabled>-- Chọn nhân viên trong danh sách --</option>
                  {employees.map(emp => <option key={emp.maNV} value={emp.maNV}>{emp.maNV} — {emp.hoTen} — [{getRoleBadge(emp.vaiTro)?.props?.children || emp.vaiTro}]</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Vai Trò Hệ Thống</label>
                <input readOnly disabled type="text" value={accForm.maNV ? (getRoleBadge(employees.find(e => e.maNV === accForm.maNV)?.vaiTro)?.props?.children || 'Chưa rõ') : 'Chưa chọn nhân viên'} className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-blue-700 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Trạng Thái Tài Khoản <span className="text-rose-500">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input type="radio" name="acc-status" value="ACTIVE" checked={accForm.status === 1} onChange={() => setAccForm({ ...accForm, status: 1 })} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300" />
                    <span className="ml-2 text-sm font-bold text-slate-800 flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>Còn hoạt động</span>
                  </label>
                  <label className="flex items-center p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input type="radio" name="acc-status" value="LOCKED" checked={accForm.status === 0} onChange={() => setAccForm({ ...accForm, status: 0 })} className="w-4 h-4 text-rose-600 focus:ring-rose-500 border-slate-300" />
                    <span className="ml-2 text-sm font-bold text-slate-800 flex items-center"><span className="w-2 h-2 rounded-full bg-rose-500 mr-2"></span>Khóa tài khoản</span>
                  </label>
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-200">
                <button type="button" onClick={() => setIsAccModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">Hủy Bỏ</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all">Lưu Tài Khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Employee */}
      {isEmpModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{empForm.maNV ? 'Chỉnh Sửa Nhân Viên' : 'Thêm Mới Nhân Viên'}</h3>
                <p className="text-xs text-slate-500 font-medium">Cập nhật hồ sơ nhân sự vào cơ sở dữ liệu nhà hàng</p>
              </div>
            </div>
            <form onSubmit={handleEmpSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Họ Và Tên <span className="text-rose-500">*</span></label>
                <input required type="text" value={empForm.name} onChange={e => setEmpForm({ ...empForm, name: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Vai Trò <span className="text-rose-500">*</span></label>
                <select required value={empForm.role} onChange={e => setEmpForm({ ...empForm, role: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="" disabled>-- Chọn vai trò chuyên môn --</option>
                  <option value="ADMIN">Người quản trị (Admin)</option>
                  <option value="QUAN_LY">Người quản lý</option>
                  <option value="LE_TAN">Lễ tân</option>
                  <option value="DAU_BEP">Đầu bếp</option>
                  <option value="NHAN_VIEN_KHO">Nhân viên kho</option>
                  <option value="PHUC_VU">Nhân viên phục vụ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Số Điện Thoại <span className="text-rose-500">*</span></label>
                <input required type="tel" pattern="[0-9\s+]{9,15}" value={empForm.phone} onChange={e => setEmpForm({ ...empForm, phone: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-200">
                <button type="button" onClick={() => setIsEmpModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">Hủy Bỏ</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all">Lưu Nhân Viên</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}
    </MainLayout>
  );
}