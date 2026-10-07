import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { api } from '../../utils/api';

export default function Reception() {
  const [activeTab, setActiveTab] = useState('booking');
  const [toast, setToast] = useState(null);

  const user = JSON.parse(localStorage.getItem('nexus_user') || '{}');
  const userFullName = user.hoTen || 'Lễ Tân';
  const userNameInitials = userFullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  // Helper lấy ngày & giờ mặc định hiện tại
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getCurrentTimeStr = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  // ALL TABLES (from API)
  const [allTables, setAllTables] = useState([]);

  // BOOKING STATES
  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [showEditAlert, setShowEditAlert] = useState(false);
  const [showCreateSuccess, setShowCreateSuccess] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullname: '',
    phone: '',
    date: getTodayStr(),
    time: getCurrentTimeStr(),
    table: '',
    adults: 2,
    children: 0,
    requirements: ''
  });

  // BILLING STATES
  const [servingTables, setServingTables] = useState([]);
  const [selectedServingTableId, setSelectedServingTableId] = useState(null);
  const [billingSearch, setBillingSearch] = useState('');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState({ code: '', discount: 0, message: '', type: '' });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [billDetail, setBillDetail] = useState(null);

  // --- DATA FETCHING ---
  useEffect(() => {
    fetchAllTables();
    fetchBookings();
    fetchServingTables();
  }, []);

  const fetchAllTables = async () => {
    try {
      const res = await api.get('/api/ban-an');
      setAllTables(res.map(t => ({ id: t.tenBan, maBan: t.maBan, seats: t.soCho, trangThai: t.trangThai })));
    } catch (e) { console.error('Lỗi tải danh sách bàn:', e); }
  };

  const fetchBookings = async () => {
    try {
      const res = await api.get('/api/phieu-dat-ban');
      const mapped = res.map(b => ({
        id: b.maPhieuDB,
        displayId: b.maPhieuHienThi,
        fullname: b.tenKhachHang,
        phone: b.soDienThoai,
        date: b.ngayDat,
        time: b.gioDat ? b.gioDat.substring(0, 5) : '',
        table: b.maBan,
        adults: b.soNguoiLon,
        children: b.soTreEm,
        requirements: b.yeuCau || '',
        status: 'Đã xác nhận'
      }));
      setBookings(mapped);
      if (mapped.length > 0 && !selectedBookingId) setSelectedBookingId(mapped[0].id);
    } catch (e) { console.error('Lỗi tải phiếu đặt bàn:', e); }
  };

  const fetchServingTables = async () => {
    try {
      const res = await api.get('/api/thanh-toan/ban-dang-phuc-vu');
      const mapped = res.map(t => ({
        tableId: t.tenBan,
        maBan: t.maBan,
        maPhieuGM: t.maPhieuGM,
        orderCode: t.maPhieuHienThi || `ORD-${t.maPhieuGM}`,
        customer: t.tenKhachHang || 'Khách vãng lai',
        phone: t.soDienThoai || '',
        trangThai: t.trangThai
      }));
      setServingTables(mapped);
      if (mapped.length > 0 && !selectedServingTableId) setSelectedServingTableId(mapped[0].tableId);
    } catch (e) { console.error('Lỗi tải bàn phục vụ:', e); }
  };

  // Fetch bill detail when selecting a serving table
  useEffect(() => {
    const selected = servingTables.find(t => t.tableId === selectedServingTableId);
    if (selected && selected.maPhieuGM) {
      fetchBillDetail(selected.maPhieuGM);
    } else {
      setBillDetail(null);
    }
  }, [selectedServingTableId, servingTables]);

  const fetchBillDetail = async (maPhieuGM) => {
    try {
      const res = await api.get(`/api/thanh-toan/chi-tiet/${maPhieuGM}`);
      setBillDetail(res);
    } catch (e) { console.error('Lỗi tải chi tiết thanh toán:', e); }
  };

  useEffect(() => {
    const booking = bookings.find(b => b.id === selectedBookingId);
    if (booking) setEditFormData({ ...booking });
    else setEditFormData(null);
  }, [selectedBookingId, bookings]);

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' đ';

  // --- BOOKING ACTIONS ---
  const getAvailableTables = (excludeBookingId = null) => {
    // 1. Lấy ngày và giờ đang thao tác
    const currentSelectedDate = excludeBookingId ? editFormData?.date : createForm?.date;
    const currentSelectedTime = excludeBookingId ? editFormData?.time : createForm?.time;

    // Đổi giờ đang chọn ra phút (VD: 14:30 = 14*60 + 30 = 870)
    const [selH, selM] = (currentSelectedTime || "00:00").split(':').map(Number);
    const selectedMinutes = selH * 60 + selM;

    // 2. Tìm các bàn bị kẹt lịch
    const occupiedTableIds = bookings.filter(b => {
      if (b.id === excludeBookingId || !b.table) return false;

      // Nếu TRÙNG NGÀY thì mới kiểm tra giờ
      if (b.date === currentSelectedDate) {
        const [bookedH, bookedM] = b.time.split(':').map(Number);
        const bookedMinutes = bookedH * 60 + bookedM;

        // Kẹt lịch nếu khoảng cách thời gian DƯỚI 4 tiếng (240 phút)
        if (Math.abs(selectedMinutes - bookedMinutes) < 240) {
          return true;
        }
      }
      return false;
    }).map(b => b.table);

    return allTables.map(t => ({
      ...t,
      // Bàn bị chiếm nếu kẹt lịch (nằm trong mảng occupiedTableIds)
      isOccupied: occupiedTableIds.includes(t.maBan),
      isCurrent: excludeBookingId && bookings.find(b => b.id === excludeBookingId)?.table === t.maBan
    }));
  };

  const handleSaveEditBooking = async (e) => {
    e.preventDefault();
    // -- BẮT ĐẦU ĐOẠN THÊM MỚI: KIỂM TRA ĐỤNG GIỜ (4 TIẾNG) --
    const [selH, selM] = editFormData.time.split(':').map(Number);
    const selectedMins = selH * 60 + selM;

    const isConflict = bookings.some(b => {
      // Bỏ qua chính cái phiếu mình đang sửa
      if (b.id === selectedBookingId) return false;

      if (b.table === editFormData.table && b.date === editFormData.date) {
        const [bh, bm] = b.time.split(':').map(Number);
        const bookedMins = bh * 60 + bm;
        return Math.abs(selectedMins - bookedMins) < 240;
      }
      return false;
    });

    if (isConflict) {
      showToast('Bàn đã được đặt vào khoảng thời gian đó! (Phải cách ít nhất 4 tiếng)', false);
      return;
    }
    // -- KẾT THÚC ĐOẠN THÊM MỚI --
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(editFormData.phone)) {
      showToast('Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số.', false);
      return; // Lệnh return này sẽ dừng hàm lại, không chạy xuống phần try...catch bên dưới nữa
    }
    try {
      const payload = {
        tenKhachHang: editFormData.fullname,
        soDienThoai: editFormData.phone,
        ngayDat: editFormData.date,
        gioDat: editFormData.time + ':00',
        maBan: editFormData.table,
        soNguoiLon: editFormData.adults,
        soTreEm: editFormData.children,
        yeuCau: editFormData.requirements
      };
      await api.put(`/api/phieu-dat-ban/${selectedBookingId}`, payload);
      setShowEditAlert(true);
      setTimeout(() => setShowEditAlert(false), 3000);
      fetchBookings();
    } catch (e) {
      alert('Lỗi cập nhật: ' + (e.message || e));
    }
  };

  const handleDeleteBooking = async () => {
    if (!selectedBookingId) return;
    const booking = bookings.find(b => b.id === selectedBookingId);
    if (window.confirm(`Bạn có chắc chắn muốn hủy phiếu đặt bàn #${booking.displayId || booking.id} của khách hàng ${booking.fullname}?`)) {
      try {
        await api.delete(`/api/phieu-dat-ban/${selectedBookingId}`);
        const newBookings = bookings.filter(b => b.id !== selectedBookingId);
        setBookings(newBookings);
        setSelectedBookingId(newBookings[0]?.id || null);
      } catch (e) {
        alert('Lỗi hủy phiếu: ' + (e.message || e));
      }
    }
  };

  const showToast = (message, isSuccess = true) => {
    setToast({ message, isSuccess });
    setTimeout(() => setToast(null), 2500);
  };

  const handleMarkArrived = async () => {
    if (!selectedBookingId) return;
    const booking = bookings.find(b => b.id === selectedBookingId);
    if (window.confirm(`Xác nhận khách hàng ${booking.fullname} đã đến nhận bàn?`)) {
      try {
        await api.put(`/api/phieu-dat-ban/${selectedBookingId}/da-den`);
        const newBookings = bookings.filter(b => b.id !== selectedBookingId);
        setBookings(newBookings);
        setSelectedBookingId(newBookings[0]?.id || null);
      } catch (e) {
        alert('Lỗi cập nhật: ' + (e.message || e));
      }
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    // -- BẮT ĐẦU ĐOẠN THÊM MỚI: KIỂM TRA ĐỤNG GIỜ (4 TIẾNG) --
    const [selH, selM] = createForm.time.split(':').map(Number);
    const selectedMins = selH * 60 + selM;

    const isConflict = bookings.some(b => {
      if (b.table === createForm.table && b.date === createForm.date) {
        const [bh, bm] = b.time.split(':').map(Number);
        const bookedMins = bh * 60 + bm;
        return Math.abs(selectedMins - bookedMins) < 240;
      }
      return false;
    });

    if (isConflict) {
      showToast('Bàn đã được đặt vào khoảng thời gian đó! (Phải cách ít nhất 4 tiếng)', false);
      return; // Dừng lại, không cho gửi API
    }
    // -- KẾT THÚC ĐOẠN THÊM MỚI --
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(createForm.phone)) {
      showToast('Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số.', false);
      return; // Lệnh return này sẽ dừng hàm lại, không chạy xuống phần try...catch bên dưới nữa
    }
    try {
      const payload = {
        tenKhachHang: createForm.fullname,
        soDienThoai: createForm.phone,
        ngayDat: createForm.date,
        gioDat: createForm.time + ':00',
        maBan: createForm.table,
        soNguoiLon: createForm.adults,
        soTreEm: createForm.children,
        yeuCau: createForm.requirements
      };
      await api.post('/api/phieu-dat-ban', payload);
      setIsCreateModalOpen(false);
      setShowCreateSuccess(true);
      setTimeout(() => setShowCreateSuccess(false), 3000);
      setCreateForm({
        fullname: '',
        phone: '',
        date: getTodayStr(),
        time: getCurrentTimeStr(),
        table: '',
        adults: 2,
        children: 0,
        requirements: ''
      });
      fetchBookings();
    } catch (e) {
      alert('Lỗi tạo phiếu: ' + (e.message || e));
    }
  };

  const openCreateModal = () => {
    const availableTables = getAvailableTables().filter(t => !t.isOccupied);
    setCreateForm({ ...createForm, table: availableTables[0]?.maBan || '' });
    setIsCreateModalOpen(true);
  };

  // --- BILLING ACTIONS ---
  const filteredServingTables = servingTables.filter(t =>
    t.tableId.toLowerCase().includes(billingSearch.toLowerCase()) ||
    t.orderCode.toLowerCase().includes(billingSearch.toLowerCase()) ||
    t.customer.toLowerCase().includes(billingSearch.toLowerCase())
  );

  const selectedBill = servingTables.find(t => t.tableId === selectedServingTableId);

  // Use billDetail from API for calculations
  const billItems = billDetail?.danhSachMon || [];
  const subtotal = billDetail?.tongTienMon || 0;
  const discountAmount = billDetail?.tienKhuyenMai || 0;
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const vatAmount = billDetail?.thueVAT || (afterDiscount * 0.08);
  const grandTotal = billDetail?.tongThanhToan || (afterDiscount + vatAmount);

  const handleApplyPromo = async () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) {
      setAppliedPromo({ code: '', discount: 0, type: 'error', message: '⚠️ Vui lòng nhập mã khuyến mãi!' });
      return;
    }
    if (!selectedBill || !selectedBill.maPhieuGM) return;

    try {
      const res = await api.post('/api/thanh-toan/ap-dung-khuyen-mai', {
        maPhieuGM: selectedBill.maPhieuGM,
        maKhuyenMai: code
      });
      setAppliedPromo({ code, discount: res.tienKhuyenMai || 0, type: 'success', message: `✓ Đã áp dụng mã ${code} thành công!` });
      setBillDetail(res);
    } catch (e) {
      setAppliedPromo({ code: '', discount: 0, type: 'error', message: '✕ ' + (e.message || 'Mã ưu đãi không tồn tại hoặc đã hết hạn!') });
    }
  };

  const handleCheckout = async () => {
    if (!selectedBill || !selectedBill.maPhieuGM) return;
    try {
      await api.post('/api/thanh-toan/chot-hoa-don', {
        maPhieuGM: selectedBill.maPhieuGM,
        maKhuyenMai: appliedPromo.code || null
      });
      const methodNames = { cash: 'Tiền mặt', qr: 'Chuyển khoản QR (VietQR)', card: 'Thẻ POS ngân hàng' };
      setSuccessData({
        code: `INV-${selectedBill.orderCode}`,
        total: formatCurrency(grandTotal),
        method: methodNames[paymentMethod],
        desc: `Hóa đơn ${selectedBill.tableId} (${selectedBill.customer}) đã hoàn tất thanh toán. Bàn đã được dọn và chuyển về trạng thái sẵn sàng!`
      });
      setIsSuccessModalOpen(true);
      fetchServingTables();
      fetchAllTables();
    } catch (e) {
      alert('Lỗi thanh toán: ' + (e.response?.data || e.message || e));
    }
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    setSelectedServingTableId(servingTables.length > 0 ? servingTables[0].tableId : null);
    setAppliedPromo({ code: '', discount: 0, message: '', type: '' });
    setPromoCodeInput('');
    setBillDetail(null);
  };

  const topbarProps = {
    title: "Reception",
    tagText: "Trực Tuyến",
    shiftInfo: "CA TỐI (15:00 - 23:00)",
    userInfo: { name: userFullName, role: "Lễ tân", initials: userNameInitials },
    icon: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
  };

  const sidebarProps = {
    branchName: "Reception Desk",
    activeTab,
    setActiveTab,
    userInfo: { name: userFullName, role: "Lễ Tân", initials: userNameInitials },
    navItems: [
      {
        id: 'booking',
        label: 'Đặt Bàn',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
      },
      {
        id: 'billing',
        label: 'Thanh Toán',
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"></path></svg>
      }
    ]
  };

  return (
    <MainLayout topbarProps={topbarProps} sidebarProps={sidebarProps}>
      <div className="absolute inset-0 flex overflow-hidden">

        {/* TAB 1: BOOKING */}
        {activeTab === 'booking' && (
          <>
            <div className="flex-1 flex flex-col bg-slate-100/50" style={{ backgroundImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
              <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-bold text-slate-900">Danh Sách Phiếu Đặt Bàn</h2>
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">Tổng: {bookings.length} phiếu</span>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors" onClick={openCreateModal}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                  <span>Thêm Phiếu Đặt Bàn</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {bookings.map(b => (
                    <div key={b.id} onClick={() => setSelectedBookingId(b.id)} className={`cursor-pointer transition-all duration-150 rounded-2xl p-5 border ${b.id === selectedBookingId ? 'bg-white ring-2 ring-blue-600 border-transparent shadow-md' : 'bg-white hover:border-slate-300 border-slate-200 shadow-sm hover:shadow'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${b.id === selectedBookingId ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>#{b.displayId || b.id}</span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-sm">
                            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="6" width="16" height="8" rx="2" strokeWidth="1.8"></rect><path d="M6 14v6M18 14v6M10 14v4M14 14v4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"></path></svg>
                            {allTables.find(t => t.maBan === b.table)?.id || b.table}
                          </span>
                        </div>
                      </div>
                      <div className="mb-2">
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600">{b.fullname}</h4>

                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 font-mono">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                            {b.phone}
                          </span>
                          <span className="flex items-center gap-1 text-slate-700 font-semibold bg-slate-100 px-1.5 py-0.5 rounded">
                            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            {b.date?.split('-').reverse().join('/')} • {b.time}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 py-2 px-3 bg-slate-50 rounded-xl my-3 text-xs">
                        <div><span className="text-slate-400 block text-[10px] uppercase font-semibold">Người lớn</span><span className="font-bold text-slate-800">{b.adults} người</span></div>
                        <div><span className="text-slate-400 block text-[10px] uppercase font-semibold">Trẻ em</span><span className="font-bold text-slate-800">{b.children} bé</span></div>
                      </div>
                      <div className="text-xs text-slate-600 line-clamp-2"><span className="font-semibold text-slate-700">Yêu cầu:</span> {b.requirements}</div>
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                      <p className="text-sm font-semibold text-slate-700">Chưa có phiếu đặt bàn nào</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* BOOKING EDIT PANEL */}
            <div className={`absolute right-0 inset-y-0 z-30 max-md:w-full sm:w-96 lg:static bg-white lg:border-l border-slate-200 flex flex-col flex-shrink-0 shadow-2xl lg:shadow-sm transition-transform duration-300 ${selectedBookingId ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
              <div className="p-5 border-b border-slate-200 bg-slate-50/50 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">Chỉnh Sửa Phiếu Đặt</h3>
                      <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-blue-100 text-blue-700">#{editFormData?.displayId || selectedBookingId || '---'}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Xem và chỉnh sửa trực tiếp thông tin</p>
                  </div>

                  {/* Nút Đóng (Chỉ hiện trên Mobile & Tablet) */}
                  <button
                    onClick={() => setSelectedBookingId(null)}
                    className="lg:hidden w-8 h-8 flex items-center justify-center text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors shadow-sm flex-shrink-0"
                    title="Đóng bảng"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>

                <div className="flex gap-2 w-full">
                  <button onClick={handleMarkArrived} className="flex-1 justify-center p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1 text-xs font-semibold" title="Xác nhận khách đã đến">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span>Đã đến</span>
                  </button>
                  <button onClick={handleDeleteBooking} className="flex-1 justify-center p-2 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors flex items-center gap-1 text-xs font-semibold" title="Hủy phiếu đặt bàn này">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    <span>Hủy</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {editFormData ? (
                  <form className="space-y-4" onSubmit={handleSaveEditBooking}>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Mã Phiếu Đặt</label>
                      <input className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-700 cursor-not-allowed" readOnly type="text" value={`#${editFormData.displayId || editFormData.id}`} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên khách hàng <span className="text-rose-500">*</span></label>
                      <input className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" required type="text" value={editFormData.fullname} onChange={e => setEditFormData({ ...editFormData, fullname: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại <span className="text-rose-500">*</span></label>
                      <input className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" required type="tel" value={editFormData.phone} onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })} />
                    </div>

                    {/* NGÀY ĐẶT & GIỜ ĐẶT (FORM CHỈNH SỬA) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày đặt <span className="text-rose-500">*</span></label>
                        <input className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" required type="date" value={editFormData.date || ''} onChange={e => setEditFormData({ ...editFormData, date: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Giờ đặt <span className="text-rose-500">*</span></label>
                        <input className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" required type="time" value={editFormData.time || ''} onChange={e => setEditFormData({ ...editFormData, time: e.target.value })} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Bàn được xếp <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <select className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none appearance-none pr-8" required value={editFormData.table} onChange={e => setEditFormData({ ...editFormData, table: e.target.value })}>
                          {getAvailableTables(editFormData.id).map(t => (
                            <option key={t.maBan} value={t.maBan} disabled={t.isOccupied && !t.isCurrent}>
                              {t.id} ({t.seats} chỗ) - {t.isCurrent ? 'Hiện tại của phiếu' : t.isOccupied ? 'Đã có khách' : 'Trống'}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Người lớn <span className="text-rose-500">*</span></label>
                        <div className="relative">
                          <input className="w-full pl-3 pr-14 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" max="50" min="1" required type="number" value={editFormData.adults} onChange={e => setEditFormData({ ...editFormData, adults: parseInt(e.target.value) || '' })} />
                          <span className="absolute right-3 top-2 text-xs text-slate-400">người</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Trẻ em</label>
                        <div className="relative">
                          <input className="w-full pl-3 pr-12 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" max="20" min="0" type="number" value={editFormData.children} onChange={e => setEditFormData({ ...editFormData, children: parseInt(e.target.value) || 0 })} />
                          <span className="absolute right-3 top-2 text-xs text-slate-400">bé</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Yêu cầu</label>
                      <textarea className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows="3" value={editFormData.requirements} onChange={e => setEditFormData({ ...editFormData, requirements: e.target.value })}></textarea>
                    </div>

                    {showEditAlert && (
                      <div className="p-2.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        <span>Đã lưu thay đổi thành công!</span>
                      </div>
                    )}

                    <div className="pt-2">
                      <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2" type="submit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        <span>Lưu Cập Nhật Phiếu</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center text-slate-400 text-sm mt-10">Chưa chọn phiếu đặt bàn</div>
                )}
              </div>
            </div>
          </>
        )}

        {/* TAB 2: BILLING */}
        {activeTab === 'billing' && (
          <>
            <div className="flex-1 flex flex-col bg-slate-100/50" style={{ backgroundImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
              <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-bold text-slate-900">Danh Sách Bàn Đang Phục Vụ</h2>
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full">{servingTables.length} bàn cần thanh toán</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input className="w-56 pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white" placeholder="Tìm số bàn, mã order..." type="text" value={billingSearch} onChange={e => setBillingSearch(e.target.value)} />
                    <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredServingTables.map(item => (
                    <div key={item.tableId} onClick={() => setSelectedServingTableId(item.tableId)} className={`cursor-pointer transition-all duration-150 rounded-2xl p-5 border ${item.tableId === selectedServingTableId ? 'bg-white ring-2 ring-blue-600 border-transparent shadow-md' : 'bg-white hover:border-slate-300 border-slate-200 shadow-sm hover:shadow'}`}>
                      <div className="flex items-start justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-bold ${item.tableId === selectedServingTableId ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white'}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="6" width="16" height="8" rx="2" strokeWidth="1.8"></rect><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6 14v6M18 14v6M10 14v4M14 14v4"></path></svg>
                            {item.tableId}
                          </span>
                          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">#{item.orderCode}</span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <h4 className="text-base font-bold text-slate-900">{item.customer}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1 font-mono"><svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>{item.phone}</span>
                          <span>•</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className={`text-[11px] ${item.tableId === selectedServingTableId ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
                          {item.tableId === selectedServingTableId ? '● Đang chọn thanh toán' : 'Nhấp để xuất hóa đơn'}
                        </span>
                        <svg className={`w-4 h-4 ${item.tableId === selectedServingTableId ? 'text-blue-600' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </div>
                    </div>
                  ))}
                  {filteredServingTables.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                      <p className="text-sm font-semibold text-slate-800">Tất cả bàn đã thanh toán xong</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* BILLING DETAIL PANEL */}
            <div className={`absolute right-0 inset-y-0 z-30 max-md:w-full sm:w-[430px] lg:static bg-white lg:border-l border-slate-200 flex flex-col flex-shrink-0 shadow-2xl lg:shadow-sm transition-transform duration-300 ${selectedServingTableId ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
              {selectedBill && billDetail ? (
                <>
                  <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between flex-shrink-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">Thanh Toán - {selectedBill.tableId}</h3>
                        <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-amber-100 text-amber-800">#{selectedBill.orderCode}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Chờ tính tiền
                      </span>

                      {/* Nút Đóng (Chỉ hiện trên Mobile & Tablet) */}
                      <button
                        onClick={() => setSelectedServingTableId(null)}
                        className="lg:hidden w-8 h-8 flex items-center justify-center text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors shadow-sm flex-shrink-0"
                        title="Đóng bảng"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Chi Tiết Phiếu Gọi Món</span>
                        <span className="text-[11px] text-slate-500">Tổng cộng {billItems.length}</span>
                      </div>
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                            <tr><th className="py-2.5 px-3">Tên món</th><th className="py-2.5 px-2 text-center w-12">SL</th><th className="py-2.5 px-2 text-right">Đơn giá</th><th className="py-2.5 px-3 text-right">Thành tiền</th></tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {billItems.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-2.5 px-3"><div className="font-semibold text-slate-800">{item.tenMon}</div></td>
                                <td className="py-2.5 px-2 text-center font-mono font-medium text-slate-700">{item.soLuong}</td>
                                <td className="py-2.5 px-2 text-right font-mono text-slate-500">{formatCurrency(item.donGia)}</td>
                                <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">{formatCurrency(item.thanhTien)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-200">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg> Mã khuyến mãi</span>
                      </label>
                      <div className="flex gap-2">
                        <input className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono uppercase text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none tracking-wider" placeholder="Nhập mã ưu đãi..." type="text" value={promoCodeInput} onChange={e => setPromoCodeInput(e.target.value)} />
                        <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors" onClick={handleApplyPromo}>Áp dụng</button>
                      </div>
                      {appliedPromo.message && (
                        <div className={`mt-2 text-[11px] flex items-center gap-1 font-medium ${appliedPromo.type === 'error' ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {appliedPromo.message}
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-slate-600"><span>Tổng tiền món:</span><span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span></div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between items-center text-slate-600">
                          <span className="flex items-center gap-1 text-emerald-700 font-medium">Khuyến mãi:</span>
                          <span className="font-bold text-rose-600">-{formatCurrency(discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-slate-600"><span>Thuế VAT (8%):</span><span className="font-semibold text-slate-800">{formatCurrency(vatAmount)}</span></div>
                      <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                        <span className="text-xs font-bold text-slate-900 uppercase">Tổng Thanh Toán:</span>
                        <span className="text-xl font-black text-blue-600 tracking-tight">{formatCurrency(grandTotal)}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">Phương thức thanh toán</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'cash', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>, label: 'Tiền mặt' },
                          { id: 'qr', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>, label: 'Mã QR' },
                          { id: 'card', icon: <path strokeLinecap="round" strokeWidth="1.8" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>, label: 'Thẻ POS' }
                        ].map(m => (
                          <button key={m.id} onClick={() => setPaymentMethod(m.id)} className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${paymentMethod === m.id ? 'border-2 border-blue-600 bg-blue-50/50 text-blue-700' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'}`}>
                            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">{m.icon}</svg>
                            <span className="text-[11px] font-bold">{m.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-1 pb-4">
                      <button className="w-full py-2.5 px-4 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 mb-3" onClick={() => window.print()}>
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        <span>In Hóa Đơn Tạm Tính</span>
                      </button>
                      <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2" onClick={handleCheckout}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        <span>Hoàn Tất Thanh Toán ({formatCurrency(grandTotal)})</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6">{selectedBill ? 'Đang tải chi tiết hóa đơn...' : 'Chưa chọn bàn thanh toán'}</div>
              )}
            </div>
          </>
        )}
      </div>

      {/* MODALS */}
      {showCreateSuccess && (
        <div className="fixed top-5 right-5 z-[60] p-3 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
          <span>Đã thêm phiếu đặt bàn thành công</span>
        </div>
      )}

      {/* 1. Modal Thêm Phiếu Đặt Bàn */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                </div>
                <div><h3 className="text-base font-bold text-slate-900">Thêm Phiếu Đặt Bàn Mới</h3><p className="text-xs text-slate-500">Nhập đầy đủ thông tin khách</p></div>
              </div>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleCreateBooking}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Họ và tên khách hàng <span className="text-rose-500">*</span></label>
                <input className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" required type="text" value={createForm.fullname} onChange={e => setCreateForm({ ...createForm, fullname: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Số điện thoại <span className="text-rose-500">*</span></label>
                <input className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" required type="tel" value={createForm.phone} onChange={e => setCreateForm({ ...createForm, phone: e.target.value })} />
              </div>

              {/* NGÀY ĐẶT & GIỜ ĐẶT (MODAL TẠO MỚI) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ngày đặt <span className="text-rose-500">*</span></label>
                  <input className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" required type="date" value={createForm.date} onChange={e => setCreateForm({ ...createForm, date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Giờ đặt <span className="text-rose-500">*</span></label>
                  <input className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" required type="time" value={createForm.time} onChange={e => setCreateForm({ ...createForm, time: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Chọn Bàn <span className="text-rose-500">*</span></label>
                <select className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" required value={createForm.table} onChange={e => setCreateForm({ ...createForm, table: e.target.value })}>
                  <option value="" disabled>-- Chọn bàn trống --</option>
                  {getAvailableTables().filter(t => !t.isOccupied).map(t => <option key={t.maBan} value={t.maBan}>{t.id} (Trống - {t.seats} chỗ)</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Người lớn <span className="text-rose-500">*</span></label>
                  <input className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" min="1" required type="number" value={createForm.adults} onChange={e => setCreateForm({ ...createForm, adults: parseInt(e.target.value) || '' })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Trẻ em</label>
                  <input className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" min="0" type="number" value={createForm.children} onChange={e => setCreateForm({ ...createForm, children: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Yêu cầu</label>
                <textarea className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500" rows="3" value={createForm.requirements} onChange={e => setCreateForm({ ...createForm, requirements: e.target.value })}></textarea>
              </div>
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" type="button">Hủy Bỏ</button>
                <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center gap-1.5" type="submit">Tạo Phiếu Đặt Bàn</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Thanh Toán Thành Công */}
      {isSuccessModalOpen && successData && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl text-center border border-slate-100">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3.5 shadow-inner">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Thanh Toán Thành Công!</h3>
            <p className="text-xs text-slate-500 mb-4">{successData.desc}</p>
            <div className="p-3 bg-slate-50 rounded-xl mb-4 border border-slate-200 text-xs text-left space-y-1.5">
              <div className="flex justify-between"><span className="text-slate-500">Mã hóa đơn:</span><span className="font-mono font-bold text-slate-800">{successData.code}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tổng thanh toán:</span><span className="font-bold text-blue-600">{successData.total}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Hình thức:</span><span className="font-medium text-slate-700">{successData.method}</span></div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 flex items-center justify-center gap-1.5" onClick={() => { alert('In hóa đơn thành công!'); closeSuccessModal(); }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg> In Hóa Đơn
              </button>
              <button className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm" onClick={closeSuccessModal}>Đóng & Tiếp Tục</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center space-x-3 text-xs z-50 animate-in fade-in duration-300">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${toast.isSuccess ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </MainLayout>
  );
}