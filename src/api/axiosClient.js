import axios from 'axios';

// Mock data cho testing UI
const mockUsers = {
  '/auth/login': {
    token: 'mock-token-12345',
    user: {
      id: 1,
      name: 'Người Dùng Test',
      email: 'test@example.com',
      role: 'admin'
    }
  }
};

// Tạo instance của axios
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock API response cho testing UI
const mockApiCall = (endpoint, data) => {
  console.log('Mock API call to:', endpoint, 'with data:', data);
  return new Promise((resolve) => {
    setTimeout(() => {
      if (endpoint in mockUsers) {
        resolve(mockUsers[endpoint]);
      } else {
        resolve({ message: 'Mock success' });
      }
    }, 500); // Giả lập độ trễ network
  });
};

// Thêm interceptor để xử lý request
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý response
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Xử lý các lỗi HTTP
    if (error.response) {
      // Nếu có lỗi 401, có thể chuyển hướng đến trang đăng nhập
      if (error.response.status === 401) {
        // Xử lý đăng xuất và chuyển hướng
      }
    }
    return Promise.reject(error);
  }
);

// Override các phương thức axios bằng mock data
const _originalPost = axiosClient.post;
axiosClient.post = function(endpoint, data) {
  // Comment dòng dưới đây và uncomment dòng tiếp theo để sử dụng API thật
  return mockApiCall(endpoint, data);
  // return _originalPost.apply(this, arguments);
};

const _originalGet = axiosClient.get;
axiosClient.get = function(endpoint, config) {
  // Comment dòng dưới đây và uncomment dòng tiếp theo để sử dụng API thật
  return mockApiCall(endpoint, config);
  // return _originalGet.apply(this, arguments);
};

export default axiosClient;