import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';

// --- MOCK DATA ---
const INITIAL_EMPLOYEES = [
  { id: 1, name: "Nguyễn Mai A", role: "Lễ tân", phone: "0912 345 678" },
  { id: 2, name: "Trần Minh Quân", role: "Người quản lý", phone: "0908 123 456" },
  { id: 3, name: "Lê Văn Hùng", role: "Đầu bếp", phone: "0934 567 890" },
  { id: 4, name: "Phạm Quốc Tuấn", role: "Nhân viên kho", phone: "0978 901 234" },
  { id: 5, name: "Hoàng Thị Thảo", role: "Nhân viên phục vụ", phone: "0965 432 109" },
  { id: 6, name: "Đặng Tiến Dũng", role: "Nhân viên phục vụ", phone: "0987 654 321" },
  { id: 7, name: "Vũ Hải Đăng", role: "Đầu bếp", phone: "0945 678 123" },
  { id: 8, name: "Bùi Bích Phương", role: "Lễ tân", phone: "0923 456 789" }
];

const INITIAL_ACCOUNTS = [
  { id: 101, username: "letan_maia", rawPassword: "password123", employeeId: 1, status: "ACTIVE" },
  { id: 102, username: "quanly_quan", rawPassword: "manager@2026", employeeId: 2, status: "ACTIVE" },
  { id: 103, username: "chefbep_hung", rawPassword: "kitchen2026", employeeId: 3, status: "ACTIVE" },
  { id: 104, username: "kho_tuan", rawPassword: "stockroom@pass", employeeId: 4, status: "ACTIVE" },
  { id: 105, username: "phucvu_thao", rawPassword: "service_thao", employeeId: 5, status: "ACTIVE" },
  { id: 106, username: "phucvu_dung", rawPassword: "service_dung99", employeeId: 6, status: "LOCKED" }
];

export default function Admin() {
  // GLOBAL STATES
  const [activeTab, setActiveTab] = useState('accounts');
  const [toast, setToast] = useState(null);

  // DATA STATES
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);

  // ACCOUNTS TAB STATES
  const [accSearch, setAccSearch] = useState('');
  const [accStatusFilter, setAccStatusFilter] = useState('ALL');
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [accForm, setAccForm] = useState({ id: null, username: '', password: '', employeeId: '', status: 'ACTIVE' });
  const [visiblePasswords, setVisiblePasswords] = useState({});

  // EMPLOYEES TAB STATES
  const [empSearch, setEmpSearch] = useState('');
  const [empRoleFilter, setEmpRoleFilter] = useState('ALL');
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [empForm, setEmpForm] = useState({ id: null, name: '', role: '', phone: '' });

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // --- HELPERS ---
  const getRoleBadge = (role) => {
    switch(role) {
      case 'Người quản lý': return <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">{role}</span>;
      case 'Lễ tân': return <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">{role}</span>;
      case 'Đầu bếp': return <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">{role}</span>;
      case 'Nhân viên kho': return <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">{role}</span>;
      case 'Nhân viên phục vụ': return <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">{role}</span>;
      default: return <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">{role}</span>;
    }
  };

  // --- ACCOUNTS LOGIC ---
  const filteredAccounts = accounts.filter(acc => {
    const emp = employees.find(e => e.id === acc.employeeId);
    const empName = emp ? emp.name.toLowerCase() : '';
    const empRole = emp ? emp.role.toLowerCase() : '';
    const matchSearch = acc.username.toLowerCase().includes(accSearch.toLowerCase()) || empName.includes(accSearch.toLowerCase()) || empRole.includes(accSearch.toLowerCase());
    const matchStatus = accStatusFilter === 'ALL' || acc.status === accStatusFilter;
    return matchSearch && matchStatus;
  });

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLockAccount = (id) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === id) {
        const newStatus = acc.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
        showToast(newStatus === 'ACTIVE' ? `Đã mở khóa tài khoản ${acc.username}` : `Đã tạm khóa tài khoản ${acc.username}`);
        return { ...acc, status: newStatus };
      }
      return acc;
    }));
  };

  const openAccModal = (acc = null) => {
    if (acc) {
      setAccForm({ id: acc.id, username: acc.username, password: acc.rawPassword, employeeId: acc.employeeId, status: acc.status });
    } else {
      setAccForm({ id: null, username: '', password: '', employeeId: '', status: 'ACTIVE' });
    }
    setIsAccModalOpen(true);
  };

  const generateRandomPassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
    let pwd = "";
    for (let i = 0; i < 10; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    setAccForm(prev => ({ ...prev, password: pwd }));
  };

  const handleAccSave = (e) => {
    e.preventDefault();
    if (!accForm.employeeId) {
      alert("Vui lòng chọn nhân viên gắn với tài khoản này!");
      return;
    }

    if (accForm.id) {
      setAccounts(prev => prev.map(a => a.id === accForm.id ? { ...a, username: accForm.username, rawPassword: accForm.password, employeeId: Number(accForm.employeeId), status: accForm.status } : a));
      showToast(`Đã cập nhật tài khoản "${accForm.username}"!`);
    } else {
      const newAcc = {
        id: Date.now(),
        username: accForm.username,
        rawPassword: accForm.password,
        employeeId: Number(accForm.employeeId),
        status: accForm.status
      };
      setAccounts([newAcc, ...accounts]);
      showToast(`Đã thêm thành công tài khoản "${accForm.username}"!`);
    }
    setIsAccModalOpen(false);
  };

  // --- EMPLOYEES LOGIC ---
  const filteredEmployees = employees.filter(emp => {
    const matchSearch = emp.name.toLowerCase().includes(empSearch.toLowerCase()) || emp.phone.includes(empSearch) || emp.role.toLowerCase().includes(empSearch.toLowerCase());
    const matchRole = empRoleFilter === 'ALL' || emp.role === empRoleFilter;
    return matchSearch && matchRole;
  });

  const assignedCount = employees.filter(e => accounts.some(a => a.employeeId === e.id)).length;

  const openEmpModal = (emp = null) => {
    if (emp) setEmpForm({ ...emp });
    else setEmpForm({ id: null, name: '', role: '', phone: '' });
    setIsEmpModalOpen(true);
  };

  const handleEmpSave = (e) => {
    e.preventDefault();
    if (empForm.id) {
      setEmployees(prev => prev.map(emp => emp.id === empForm.id ? { ...empForm } : emp));
      showToast(`Đã cập nhật thông tin nhân viên "${empForm.name}"!`);
    } else {
      setEmployees([{ ...empForm, id: Date.now() }, ...employees]);
      showToast(`Đã thêm nhân viên "${empForm.name}" thành công!`);
    }
    setIsEmpModalOpen(false);
  };

  // --- CẤU HÌNH LAYOUT DÙNG CHUNG ---
  const topbarProps = {
    title: "NexusCore System Admin",
    subtitle: "Hệ thống Quản trị Tài khoản & Phân quyền Nhân sự",
    tagText: "Hệ Thống Trực Tuyến",
    shiftInfo: "HỆ THỐNG QUẢN TRỊ CAO CẤP",
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
        <div className="flex-1 flex flex-col space-y-6 animate-in fade-in duration-200 h-full">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản Lý Danh Sách Tài Khoản</h1>
              </div>
              <p className="text-sm text-slate-500 mt-1">Theo dõi, cấp mới và phân quyền tài khoản truy cập tương ứng cho nhân viên trong hệ thống.</p>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={() => openAccModal()} className="inline-flex items-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg> + Thêm Tài Khoản
              </button>
            </div>
          </div>

          <div className="grid gap-5 grid-cols-2">
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
                <div className="text-3xl font-extrabold text-emerald-600 mt-1">{accounts.filter(a => a.status === 'ACTIVE').length}</div>
                <div className="text-xs text-slate-500 mt-0.5">Sẵn sàng đăng nhập</div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
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

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1">
            <div className="overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-100 z-10 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="py-3.5 px-6">TÊN ĐĂNG NHẬP</th><th className="py-3.5 px-6">MẬT KHẨU</th><th className="py-3.5 px-6">HỌ VÀ TÊN NHÂN VIÊN</th><th className="py-3.5 px-6">VAI TRÒ</th><th className="py-3.5 px-6 text-center">TRẠNG THÁI</th><th className="py-3.5 px-6 text-right">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {filteredAccounts.map(acc => {
                    const emp = employees.find(e => e.id === acc.employeeId) || { name: 'Không xác định', role: 'Không xác định' };
                    const isVis = visiblePasswords[acc.id];
                    return (
                      <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-6 font-bold text-slate-900">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs uppercase">{acc.username.substring(0, 2)}</div>
                            <span className="font-mono text-sm">{acc.username}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-6 font-mono text-xs text-slate-500">
                          <div className="flex items-center space-x-2">
                            <span className={isVis ? "text-blue-700 font-bold" : ""}>{isVis ? acc.rawPassword : '••••••••'}</span>
                            <button onClick={() => togglePasswordVisibility(acc.id)} className="text-slate-400 hover:text-slate-600 transition-colors" title="Hiện/ẩn mật khẩu">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isVis ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z"}></path>{!isVis && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>}</svg>
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-6 font-semibold text-slate-800">{emp.name}</td>
                        <td className="py-3.5 px-6">{getRoleBadge(emp.role)}</td>
                        <td className="py-3.5 px-6 text-center">
                          {acc.status === 'ACTIVE' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>Còn hoạt động</span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>Khóa</span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button onClick={() => openAccModal(acc)} className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-sm">
                              <svg className="w-3.5 h-3.5 mr-1 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg> Sửa
                            </button>
                            <button onClick={() => handleLockAccount(acc.id)} className={`inline-flex items-center px-2.5 py-1.5 rounded-lg border ${acc.status === 'ACTIVE' ? 'border-amber-200 text-amber-700 bg-amber-50/50 hover:bg-amber-100' : 'border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100'} text-xs font-bold transition-all`}>
                              {acc.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
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
        <div className="flex-1 flex flex-col space-y-6 animate-in fade-in duration-200 h-full">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản Lý Danh Sách Nhân Viên</h1>
              </div>
              <p className="text-sm text-slate-500 mt-1">Thông tin hồ sơ nhân sự, phân loại vai trò chuyên môn và số điện thoại liên lạc.</p>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={() => openEmpModal()} className="inline-flex items-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg> + Thêm Mới Nhân Viên
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
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

          <div className="flex items-center space-x-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input value={empSearch} onChange={e => setEmpSearch(e.target.value)} type="text" placeholder="Tìm nhanh theo họ tên, vai trò hoặc số điện thoại..." className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
            <div className="w-56">
              <select value={empRoleFilter} onChange={e => setEmpRoleFilter(e.target.value)} className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="ALL">Tất cả vai trò</option>
                <option value="Đầu bếp">Đầu bếp</option>
                <option value="Nhân viên phục vụ">Nhân viên phục vụ</option>
                <option value="Lễ tân">Lễ tân</option>
                <option value="Nhân viên kho">Nhân viên kho</option>
                <option value="Người quản lý">Người quản lý</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1">
            <div className="overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-100 z-10 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <tr><th className="py-3.5 px-6">HỌ VÀ TÊN</th><th className="py-3.5 px-6">VAI TRÒ</th><th className="py-3.5 px-6">SỐ ĐIỆN THOẠI</th><th className="py-3.5 px-6 text-center">TÀI KHOẢN LIÊN KẾT</th><th className="py-3.5 px-6 text-right">THAO TÁC</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {filteredEmployees.map(emp => {
                    const acc = accounts.find(a => a.employeeId === emp.id);
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-6 font-bold text-slate-900">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs uppercase">
                              {emp.name.split(' ').map(n=>n[0]).join('').slice(-2)}
                            </div>
                            <span>{emp.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-6">{getRoleBadge(emp.role)}</td>
                        <td className="py-3.5 px-6 font-mono text-sm text-slate-600 font-medium">
                          <div className="flex items-center space-x-1.5">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                            <span>{emp.phone}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          {acc ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold ${acc.status === 'ACTIVE' ? 'bg-slate-100 text-blue-700' : 'bg-rose-50 text-rose-600'}`}>@{acc.username}</span>
                          ) : (
                            <span className="text-xs text-amber-600 font-medium italic">Chưa cấp tài khoản</span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <button onClick={() => openEmpModal(emp)} className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-sm">
                            <svg className="w-3.5 h-3.5 mr-1 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg> Sửa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredEmployees.length === 0 && <tr><td colSpan="5" className="py-12 text-center text-slate-400 font-medium">Không tìm thấy nhân viên phù hợp</td></tr>}
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
                <h3 className="font-bold text-lg text-slate-900">{accForm.id ? 'Chỉnh Sửa Tài Khoản' : 'Thêm Mới Tài Khoản'}</h3>
                <p className="text-xs text-slate-500 font-medium">Chọn nhân viên để tự động liên kết vai trò tương ứng</p>
              </div>
              <button onClick={() => setIsAccModalOpen(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
            <form onSubmit={handleAccSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Tên Đăng Nhập <span className="text-rose-500">*</span></label>
                <input required type="text" value={accForm.username} onChange={e => setAccForm({...accForm, username: e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Mật Khẩu <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <input required type="text" value={accForm.password} onChange={e => setAccForm({...accForm, password: e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none pr-20" />
                  <button type="button" onClick={generateRandomPassword} className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-blue-600 hover:text-blue-700">Tạo mới</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Họ Và Tên Nhân Viên <span className="text-rose-500">*</span></label>
                <select required value={accForm.employeeId} onChange={e => setAccForm({...accForm, employeeId: e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="" disabled>-- Chọn nhân viên trong danh sách --</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} — [{emp.role}]</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Vai Trò Hệ Thống</label>
                <input readOnly disabled type="text" value={accForm.employeeId ? employees.find(e => e.id === Number(accForm.employeeId))?.role : 'Chưa chọn nhân viên'} className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-blue-700 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Trạng Thái Tài Khoản <span className="text-rose-500">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input type="radio" name="acc-status" value="ACTIVE" checked={accForm.status === 'ACTIVE'} onChange={() => setAccForm({...accForm, status: 'ACTIVE'})} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300" />
                    <span className="ml-2 text-sm font-bold text-slate-800 flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>Còn hoạt động</span>
                  </label>
                  <label className="flex items-center p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input type="radio" name="acc-status" value="LOCKED" checked={accForm.status === 'LOCKED'} onChange={() => setAccForm({...accForm, status: 'LOCKED'})} className="w-4 h-4 text-rose-600 focus:ring-rose-500 border-slate-300" />
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
                <h3 className="font-bold text-lg text-slate-900">{empForm.id ? 'Chỉnh Sửa Nhân Viên' : 'Thêm Mới Nhân Viên'}</h3>
                <p className="text-xs text-slate-500 font-medium">Cập nhật hồ sơ nhân sự vào cơ sở dữ liệu nhà hàng</p>
              </div>
              <button onClick={() => setIsEmpModalOpen(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
            <form onSubmit={handleEmpSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Họ Và Tên <span className="text-rose-500">*</span></label>
                <input required type="text" value={empForm.name} onChange={e => setEmpForm({...empForm, name: e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Vai Trò <span className="text-rose-500">*</span></label>
                <select required value={empForm.role} onChange={e => setEmpForm({...empForm, role: e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="" disabled>-- Chọn vai trò chuyên môn --</option>
                  <option value="Đầu bếp">Đầu bếp</option>
                  <option value="Nhân viên phục vụ">Nhân viên phục vụ</option>
                  <option value="Lễ tân">Lễ tân</option>
                  <option value="Nhân viên kho">Nhân viên kho</option>
                  <option value="Người quản lý">Người quản lý</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Số Điện Thoại <span className="text-rose-500">*</span></label>
                <input required type="tel" pattern="[0-9\s+]{9,15}" value={empForm.phone} onChange={e => setEmpForm({...empForm, phone: e.target.value})} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
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