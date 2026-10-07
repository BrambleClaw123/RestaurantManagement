// Đọc địa chỉ Backend từ file .env (Nếu không có thì mặc định là localhost:8080)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Hàm lấy Token từ LocalStorage
const getToken = () => {
    return localStorage.getItem('token');
};

// Hàm khung (Wrapper) chung cho mọi request
async function fetchApi(endpoint, options = {}) {
    const token = getToken();

    // 1. Cấu hình Headers mặc định
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // 2. Tự động nhét "Thẻ bài" (Token) vào mọi request nếu có
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Xây dựng URL với query params nếu có
    let url = `${BASE_URL}${endpoint}`;
    if (options.params) {
        const queryString = new URLSearchParams(options.params).toString();
        url = `${url}?${queryString}`;
    }

    // Tách params ra khỏi options trước khi gửi fetch
    const { params: _params, ...fetchOptions } = options;

    // 3. Gửi request tới Backend
    const response = await fetch(url, {
        ...fetchOptions,
        headers,
    });

    // 4. Bắt lỗi Bảo mật (401 Unauthorized / 403 Forbidden)
    // Xảy ra khi Token bị hết hạn hoặc không có quyền vào trang
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('nexus_user'); // Xóa cả thông tin user nếu có
        window.location.href = '/login';       // Đá người dùng văng ra màn hình đăng nhập
        throw new Error('Phiên đăng nhập hết hạn hoặc không có quyền truy cập!');
    }

    // 5. Đọc dữ liệu trả về (Backend có thể trả về JSON hoặc Chuỗi text thuần)
    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    // 6. Bắt lỗi Nghiệp vụ (400 Bad Request / 500 Internal Error)
    // Xảy ra khi trùng tên bàn, gọi món lỗi...
    if (!response.ok) {
        throw new Error(data.message || typeof data === 'string' ? data : 'Có lỗi xảy ra từ máy chủ');
    }

    // 7. Trả về dữ liệu sạch nếu thành công
    return data;
}

// Xuất ra 4 hàm chuẩn của RESTful để dùng ở các trang khác
export const api = {
    get: (endpoint, options = {}) => fetchApi(endpoint, { method: 'GET', ...options }),

    post: (endpoint, body) => fetchApi(endpoint, { method: 'POST', body: JSON.stringify(body) }),

    put: (endpoint, body) => fetchApi(endpoint, { method: 'PUT', body: JSON.stringify(body) }),

    delete: (endpoint) => fetchApi(endpoint, { method: 'DELETE' })
};
