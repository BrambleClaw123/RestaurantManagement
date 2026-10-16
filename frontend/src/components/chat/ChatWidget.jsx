import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../utils/api';

// Câu hỏi gợi ý theo vai trò (vaiTro lưu trong localStorage khi đăng nhập)
const SUGGESTIONS = {
  QUAN_LY: ['Doanh thu hôm nay là bao nhiêu?', 'Món nào bán chạy nhất tháng này?', 'Nguyên liệu nào sắp hết?'],
  ADMIN: ['Có bao nhiêu nhân viên mỗi vai trò?', 'Những tài khoản nào đang bị khóa?', 'Tìm nhân viên tên An'],
  DAU_BEP: ['Bếp đang có những order nào?', 'Món nào đang tạm ngưng phục vụ?'],
  PHUC_VU: ['Còn những bàn nào trống?', 'Có món lẩu nào trong thực đơn?'],
  LE_TAN: ['Còn bàn trống nào cho 4 người?', 'Thực đơn có món tráng miệng nào?'],
  NHAN_VIEN_KHO: ['Nguyên liệu nào sắp hết?', 'Tồn kho thịt bò còn bao nhiêu?'],
};


// Hiển thị Markdown đơn giản (đậm, nghiêng, mã, gạch đầu dòng) bằng React element,
// không dùng dangerouslySetInnerHTML nên an toàn trước chèn HTML.
const renderInline = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**') && p.length > 4) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('`') && p.endsWith('`') && p.length > 2)
      return <code key={i} className="rounded bg-slate-100 px-1 text-[0.85em]">{p.slice(1, -1)}</code>;
    if (p.startsWith('*') && p.endsWith('*') && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
    return p;
  });
};

const renderMarkdown = (text) => {
  const blocks = [];
  let list = null;
  text.split('\n').forEach((raw, i) => {
    const line = raw.trimEnd();
    const m = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (m) {
      if (!list) { list = []; blocks.push({ type: 'list', items: list, key: i }); }
      list.push(m[1]);
    } else {
      list = null;
      if (line.trim()) blocks.push({ type: 'p', text: line.replace(/^#+\s*/, ''), key: i });
    }
  });
  return blocks.map((b) =>
    b.type === 'list' ? (
      <ul key={b.key} className="my-1 list-disc space-y-1 pl-5">
        {b.items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}
      </ul>
    ) : (
      <p key={b.key} className="my-1 first:mt-0 last:mb-0">{renderInline(b.text)}</p>
    )
  );
};

const getVaiTro = () => {
  try {
    return JSON.parse(localStorage.getItem('nexus_user') || '{}').vaiTro;
  } catch {
    return undefined;
  }
};

const WELCOME = {
  role: 'model',
  text: 'Xin chào! Mình là trợ lý ảo của nhà hàng. Bạn có thể hỏi về thực đơn, bàn, kho, doanh thu, nhân viên… (tùy quyền của tài khoản). Mình chỉ xem dữ liệu, không thay đổi dữ liệu.',
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const suggestions = SUGGESTIONS[getVaiTro()] || SUGGESTIONS.PHUC_VU;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, open]);

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || loading) return;

    // Lịch sử gửi lên backend: bỏ lời chào và các tin báo lỗi
    const history = messages
      .filter((m) => m !== WELCOME && !m.error)
      .map((m) => ({ role: m.role, text: m.text }));

    setMessages((prev) => [...prev, { role: 'user', text: message }]);
    setInput('');
    setLoading(true);
    try {
      const data = await api.post('/api/chat', { message, history });
      setMessages((prev) => [...prev, { role: 'model', text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: 'Xin lỗi, chatbot đang gặp sự cố. Vui lòng thử lại sau.', error: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-4 z-50 flex h-[32rem] max-h-[calc(100vh-7rem)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl select-text">
          <div className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
            <div>
              <div className="text-sm font-semibold">Trợ lý nhà hàng</div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([WELCOME])}
                className="rounded-md px-2 py-1 text-xs text-blue-100 hover:bg-blue-500"
                title="Xóa hội thoại"
              >
                Xóa
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-1 text-lg leading-none hover:bg-blue-500"
                aria-label="Đóng"
              >
                ×
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm ${
                    m.role === 'user'
                      ? 'rounded-br-sm bg-blue-600 text-white'
                      : m.error
                        ? 'rounded-bl-sm bg-red-50 text-red-700'
                        : 'rounded-bl-sm border border-slate-200 bg-white text-slate-800'
                  }`}
                >
                  {m.role === 'model' ? renderMarkdown(m.text) : m.text}
                </div>
              </div>
            ))}

            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs text-blue-700 hover:bg-blue-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                  Đang tra cứu…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="flex items-end gap-2 border-t border-slate-200 bg-white p-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              maxLength={1000}
              placeholder="Nhập câu hỏi…"
              className="max-h-24 flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
            >
              Gửi
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl text-white shadow-lg hover:bg-blue-700"
        aria-label="Mở chatbot"
      >
        {open ? '×' : '💬'}
      </button>
    </>
  );
}
