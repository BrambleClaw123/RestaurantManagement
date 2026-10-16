// Thông tin nhà hàng & tài khoản nhận tiền — chỉnh tại đây (hoặc đặt trong file .env của frontend)
// Ví dụ .env:
//   VITE_RESTAURANT_NAME=Nhà Hàng ABC
//   VITE_RESTAURANT_ADDRESS=12 Nguyễn Văn Bảo, Gò Vấp, TP.HCM
//   VITE_RESTAURANT_PHONE=028 1234 5678
//   VITE_BANK_ID=MB                (mã ngân hàng theo VietQR: MB, VCB, ACB, TCB, BIDV, ...)
//   VITE_BANK_ACCOUNT_NO=0123456789
//   VITE_BANK_ACCOUNT_NAME=NHA HANG ABC
const env = import.meta.env || {};

export const RESTAURANT_INFO = {
  name: env.VITE_RESTAURANT_NAME || 'NexusCore Restaurant',
  address: env.VITE_RESTAURANT_ADDRESS || '',
  phone: env.VITE_RESTAURANT_PHONE || '',
};

export const BANK_INFO = {
  bankId: env.VITE_BANK_ID || 'MB',
  accountNo: env.VITE_BANK_ACCOUNT_NO || '0765026635',
  accountName: env.VITE_BANK_ACCOUNT_NAME || 'NHA HANG NEXUSCORE',
};

// true khi chưa cấu hình tài khoản thật (đang dùng số tài khoản mẫu)
export const IS_BANK_PLACEHOLDER = false;
