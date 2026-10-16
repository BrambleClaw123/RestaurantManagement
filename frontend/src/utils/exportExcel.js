// Xuất báo cáo ra file .xlsx thật (dùng chung cấu hình với bản in: printReport)
import writeExcelFile from 'write-excel-file/universal';
import { RESTAURANT_INFO } from './restaurantConfig';
import { cellText, fmtDateTime } from './print';

const rawValue = (c) => (c && typeof c === 'object' && 'v' in c ? c.v : c);

/**
 * @param {object} d  cùng cấu trúc với printReport: title, period, meta, columns, rows, summary
 */
export async function exportReportExcel(d) {
  const cols = d.columns || [];
  const n = cols.length || 1;
  const span = (value, extra = {}) => ({ value, columnSpan: n, ...extra });

  const data = [];
  data.push([span(RESTAURANT_INFO.name.toUpperCase(), { fontWeight: 'bold' })]);
  data.push([span(String(d.title || '').toUpperCase(), { fontWeight: 'bold', fontSize: 14 })]);
  if (d.period) data.push([span(d.period)]);
  (d.meta || []).forEach(([k, v]) => data.push([span(`${k}: ${v}`)]));
  data.push([span('')]);

  data.push(cols.map((c) => ({
    value: c.label, fontWeight: 'bold', backgroundColor: '#E5E7EB', align: 'center', alignVertical: 'center',
  })));

  const widths = cols.map((c) => String(c.label).length);
  (d.rows || []).forEach((row) => {
    data.push(row.map((cell, i) => {
      const text = String(cellText(cell) ?? '');
      widths[i] = Math.max(widths[i] || 0, text.length);
      const v = rawValue(cell);
      const align = (cols[i] && cols[i].align) === 'r' ? 'right' : (cols[i] && cols[i].align) === 'c' ? 'center' : 'left';
      if (typeof v === 'number') {
        return { value: v, type: Number, align, format: (cell && cell.f) || undefined };
      }
      return { value: v == null ? '' : String(v), type: String, align };
    }));
  });

  if ((d.summary || []).length) {
    data.push([span('')]);
    d.summary.forEach(([label, value, big]) => {
      const v = rawValue(value);
      const labelCell = n > 1 ? { value: label, fontWeight: 'bold', columnSpan: n - 1, align: 'right' } : { value: label, fontWeight: 'bold' };
      const valueCell = typeof v === 'number'
        ? { value: v, type: Number, fontWeight: big ? 'bold' : undefined, format: (value && value.f) || undefined }
        : { value: String(cellText(value) ?? ''), type: String, fontWeight: big ? 'bold' : undefined, align: 'right' };
      data.push(n > 1 ? [labelCell, ...Array(n - 2).fill(null), valueCell] : [valueCell]);
    });
  }

  data.push([span('')]);
  data.push([span(`Xuất lúc ${fmtDateTime(new Date())}${d.printedBy ? ' - ' + d.printedBy : ''}`, { fontStyle: 'italic' })]);

  const blob = await writeExcelFile(data, {
    columns: widths.map((w) => ({ width: Math.min(45, Math.max(10, w + 3)) })),
  }).toBlob();

  const stamp = new Date().toISOString().slice(0, 10);
  const safeTitle = String(d.title || 'BaoCao').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^\w]+/g, '_');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${safeTitle}_${stamp}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
