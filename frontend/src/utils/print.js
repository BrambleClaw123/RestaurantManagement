// Tiện ích in: mỗi bản in là một tài liệu riêng (iframe ẩn), KHÔNG in cả giao diện web.
import { RESTAURANT_INFO } from './restaurantConfig';

export const PAYMENT_METHOD_LABELS = {
  TIEN_MAT: 'Tiền mặt',
  CHUYEN_KHOAN: 'Chuyển khoản QR',
  THE: 'Thẻ POS ngân hàng',
};

export const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const fmtMoney = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(Number(n) || 0)) + ' đ';
export const fmtNumber = (n) => new Intl.NumberFormat('vi-VN').format(Number(n) || 0);

// Ô dữ liệu báo cáo: { t: chữ hiển thị khi in, v: giá trị số thật cho Excel, f: định dạng số Excel }
export const money = (n) => ({ t: fmtMoney(n), v: Math.round(Number(n) || 0), f: '#,##0 "đ"' });
export const num = (n, prefix = '') => ({ t: prefix + fmtNumber(n), v: Number(n) || 0, f: '#,##0.##' });
export const cellText = (c) => (c && typeof c === 'object' && 't' in c ? c.t : c);

export const fmtDateTime = (value) => {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const p = (x) => String(x).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

export const fmtDate = (value) => {
  if (!value) return '';
  // 'YYYY-MM-DD' -> 'DD/MM/YYYY'
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.substring(0, 10).split('-').reverse().join('/');
  return fmtDateTime(value).split(' ')[0];
};

/**
 * In một tài liệu HTML độc lập qua iframe ẩn.
 * @param {string} title   tiêu đề (cũng là tên file gợi ý khi lưu PDF)
 * @param {string} body    nội dung HTML (đã escape)
 * @param {string} css     CSS riêng cho bản in
 */
export function printHtml(title, body, css) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none;';
  document.body.appendChild(iframe);

  const cleanup = () => { setTimeout(() => iframe.parentNode && iframe.parentNode.removeChild(iframe), 500); };

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>${css}</style></head><body>${body}</body></html>`);
  doc.close();

  const win = iframe.contentWindow;
  win.onafterprint = cleanup;
  // Chờ trình duyệt dựng xong nội dung rồi mới mở hộp thoại in
  setTimeout(() => {
    try { win.focus(); win.print(); } finally { setTimeout(cleanup, 60000); }
  }, 250);
}

/* ------------------------------------------------------------------ */
/* HÓA ĐƠN / PHIẾU TẠM TÍNH (khổ 80mm)                                */
/* ------------------------------------------------------------------ */
const RECEIPT_CSS = `
  @page { size: 80mm auto; margin: 3mm; }
  * { box-sizing: border-box; }
  body { width: 74mm; margin: 0 auto; font-family: "Segoe UI", Arial, sans-serif; font-size: 12px; color: #000; line-height: 1.35; }
  .c { text-align: center; } .r { text-align: right; } .b { font-weight: 700; }
  h1 { font-size: 15px; margin: 0; text-transform: uppercase; }
  h2 { font-size: 14px; margin: 6px 0 2px; text-transform: uppercase; }
  .muted { color: #333; font-size: 11px; }
  hr { border: 0; border-top: 1px dashed #000; margin: 6px 0; }
  .row { display: flex; justify-content: space-between; gap: 8px; }
  .row span:first-child { flex: 1; }
  .item { margin: 4px 0; }
  .item .name { font-weight: 600; }
  .total { font-size: 15px; font-weight: 800; }
  .banner { border: 1px solid #000; padding: 3px; text-align: center; font-weight: 700; font-size: 11px; margin: 6px 0; }
`;

/**
 * kind: 'provisional' (tạm tính) | 'invoice' (hóa đơn đã thanh toán)
 */
export function printReceipt(d) {
  const isInvoice = d.kind === 'invoice';
  const items = (d.items || []).map((it) => `
    <div class="item">
      <div class="name">${escapeHtml(it.tenMon)}</div>
      <div class="row"><span>${escapeHtml(it.soLuong)} x ${fmtNumber(it.donGia)}</span><span>${fmtNumber(it.thanhTien)}</span></div>
    </div>`).join('');

  const pay = d.payment || {};
  const paymentBlock = isInvoice ? `
    <hr>
    <div class="row"><span>Hình thức:</span><span class="b">${escapeHtml(PAYMENT_METHOD_LABELS[pay.method] || '')}</span></div>
    ${pay.method === 'TIEN_MAT' ? `
      <div class="row"><span>Tiền khách đưa:</span><span>${fmtMoney(pay.received)}</span></div>
      <div class="row"><span>Tiền thừa trả khách:</span><span>${fmtMoney(pay.change)}</span></div>` : ''}
    ${pay.ref ? `<div class="row"><span>Mã giao dịch:</span><span>${escapeHtml(pay.ref)}</span></div>` : ''}
  ` : '';

  const body = `
    <div class="c">
      <h1>${escapeHtml(RESTAURANT_INFO.name)}</h1>
      ${RESTAURANT_INFO.address ? `<div class="muted">${escapeHtml(RESTAURANT_INFO.address)}</div>` : ''}
      ${RESTAURANT_INFO.phone ? `<div class="muted">ĐT: ${escapeHtml(RESTAURANT_INFO.phone)}</div>` : ''}
      <h2>${isInvoice ? 'Hóa đơn thanh toán' : 'Phiếu tạm tính'}</h2>
    </div>
    ${isInvoice ? '' : '<div class="banner">TẠM TÍNH - CHƯA PHẢI HÓA ĐƠN THANH TOÁN</div>'}
    <div class="row"><span>${isInvoice ? 'Số HĐ' : 'Mã order'}:</span><span class="b">${escapeHtml(d.code)}</span></div>
    ${isInvoice && d.orderCode ? `<div class="row"><span>Mã order:</span><span>${escapeHtml(d.orderCode)}</span></div>` : ''}
    <div class="row"><span>Bàn:</span><span class="b">${escapeHtml(d.table)}</span></div>
    <div class="row"><span>Khách hàng:</span><span>${escapeHtml(d.customer)}</span></div>
    <div class="row"><span>Thu ngân:</span><span>${escapeHtml(d.cashier)}</span></div>
    <div class="row"><span>Thời gian:</span><span>${escapeHtml(fmtDateTime(d.dateTime))}</span></div>
    <hr>
    ${items || '<div class="c muted">(Chưa có món)</div>'}
    <hr>
    <div class="row"><span>Tổng tiền món:</span><span>${fmtMoney(d.subtotal)}</span></div>
    ${d.discount > 0 ? `<div class="row"><span>Khuyến mãi${d.promoCode ? ' (' + escapeHtml(d.promoCode) + ')' : ''}:</span><span>-${fmtMoney(d.discount)}</span></div>` : ''}
    <div class="row"><span>Thuế VAT (8%):</span><span>${fmtMoney(d.vat)}</span></div>
    <div class="row total"><span>TỔNG THANH TOÁN:</span><span>${fmtMoney(d.total)}</span></div>
    ${paymentBlock}
    <hr>
    <div class="c muted">${isInvoice ? 'Cảm ơn quý khách - Hẹn gặp lại!' : 'Vui lòng kiểm tra lại trước khi thanh toán'}</div>
  `;

  printHtml(`${isInvoice ? 'HoaDon' : 'TamTinh'}_${String(d.code || '').replace(/[^\w-]/g, '')}`, body, RECEIPT_CSS);
}

/* ------------------------------------------------------------------ */
/* BÁO CÁO / PHIẾU KHỔ A4                                              */
/* ------------------------------------------------------------------ */
const REPORT_CSS = `
  @page { size: A4; margin: 15mm; }
  * { box-sizing: border-box; }
  body { font-family: "Times New Roman", "Segoe UI", serif; font-size: 13px; color: #000; line-height: 1.4; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; }
  .head .org { font-weight: 700; text-transform: uppercase; }
  .head .sub { font-size: 12px; }
  h1 { text-align: center; font-size: 20px; margin: 14px 0 2px; text-transform: uppercase; }
  .period { text-align: center; font-style: italic; margin-bottom: 10px; }
  .meta { margin: 8px 0; }
  .meta div { margin: 2px 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }
  th, td { border: 1px solid #000; padding: 5px 7px; font-size: 12px; }
  th { background: #eee; text-align: center; }
  .l { text-align: left; } .r { text-align: right; } .c { text-align: center; }
  .summary { margin-top: 10px; width: 55%; margin-left: auto; }
  .summary div { display: flex; justify-content: space-between; padding: 2px 0; }
  .summary .big { font-weight: 700; font-size: 14px; border-top: 1px solid #000; margin-top: 3px; padding-top: 4px; }
  .sign { display: flex; justify-content: space-around; margin-top: 36px; text-align: center; page-break-inside: avoid; }
  .sign .t { font-weight: 700; } .sign .h { font-style: italic; font-size: 11px; margin-bottom: 60px; }
  .printed { margin-top: 18px; font-size: 11px; color: #444; text-align: right; }
`;

/**
 * @param {object} d
 *  title, period, meta: [[label, value]], columns: [{label, align:'l'|'c'|'r'}],
 *  rows: [[cell,...]], summary: [[label, value, big?]], signatures: ['Người lập', ...]
 */
export function printReport(d) {
  const cols = d.columns || [];
  const head = cols.map((c) => `<th>${escapeHtml(c.label)}</th>`).join('');
  const rows = (d.rows || []).map((r) =>
    `<tr>${r.map((cell, i) => `<td class="${(cols[i] && cols[i].align) || 'l'}">${escapeHtml(cellText(cell))}</td>`).join('')}</tr>`
  ).join('') || `<tr><td colspan="${cols.length || 1}" class="c">Không có dữ liệu</td></tr>`;

  const body = `
    <div class="head">
      <div>
        <div class="org">${escapeHtml(RESTAURANT_INFO.name)}</div>
        ${RESTAURANT_INFO.address ? `<div class="sub">${escapeHtml(RESTAURANT_INFO.address)}</div>` : ''}
        ${RESTAURANT_INFO.phone ? `<div class="sub">ĐT: ${escapeHtml(RESTAURANT_INFO.phone)}</div>` : ''}
      </div>
      ${d.code ? `<div class="sub">Số: <b>${escapeHtml(d.code)}</b></div>` : ''}
    </div>
    <h1>${escapeHtml(d.title)}</h1>
    ${d.period ? `<div class="period">${escapeHtml(d.period)}</div>` : ''}
    ${(d.meta || []).length ? `<div class="meta">${d.meta.map(([k, v]) => `<div><b>${escapeHtml(k)}:</b> ${escapeHtml(v)}</div>`).join('')}</div>` : ''}
    <table>
      <thead><tr>${head}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${(d.summary || []).length ? `<div class="summary">${d.summary.map(([k, v, big]) => `<div class="${big ? 'big' : ''}"><span>${escapeHtml(k)}</span><span>${escapeHtml(cellText(v))}</span></div>`).join('')}</div>` : ''}
    ${(d.signatures || []).length ? `<div class="sign">${d.signatures.map((s) => `<div><div class="t">${escapeHtml(s)}</div><div class="h">(Ký, ghi rõ họ tên)</div></div>`).join('')}</div>` : ''}
    <div class="printed">In lúc ${escapeHtml(fmtDateTime(new Date()))}${d.printedBy ? ' - ' + escapeHtml(d.printedBy) : ''}</div>
  `;

  printHtml(String(d.title || 'BaoCao').replace(/\s+/g, '_'), body, REPORT_CSS);
}
