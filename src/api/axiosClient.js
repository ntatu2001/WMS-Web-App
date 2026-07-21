import axios from 'axios';
import store from '../store/store';
import { tokensRefreshed, logout } from '../store/slices/authSlice';

const BASE_URL = 'http://localhost:5037/WarehouseAPI/';

const axiosClient = axios.create ({
    baseURL: BASE_URL,
    headers : {
      'Content-Type' : 'application/json',
    },
});

// Interceptors

// Gắn access token vào mọi request (Authentication_Authorization_Guide.md mục 4)
axiosClient.interceptors.request.use(function (config) {
    const accessToken = store.getState().auth.accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  }, function (error) {
    return Promise.reject(error);
  });

// Tự động refresh khi gặp 401, có hàng đợi tránh gọi refresh nhiều lần song song (guide mục 5.2)
let isRefreshing = false;
let pendingQueue = [];

axiosClient.interceptors.response.use(function (response) {
    return response.data;
  }, async function (error) {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest?.url?.startsWith('Auth/Login') || originalRequest?.url?.startsWith('Auth/Refresh');

    if (error.response?.status !== 401 || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Đã có 1 request khác đang refresh — xếp hàng chờ token mới
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          onSuccess: (newAccessToken) => {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            resolve(axiosClient(originalRequest));
          },
          onError: (refreshError) => reject(refreshError),
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = store.getState().auth.refreshToken;
      if (!refreshToken) {
        throw error;
      }

      // Dùng axios trần (không qua axiosClient) để tránh đệ quy interceptor
      const { data } = await axios.post(`${BASE_URL}Auth/Refresh`, { refreshToken });

      store.dispatch(tokensRefreshed({ accessToken: data.accessToken, refreshToken: data.refreshToken }));

      pendingQueue.forEach((callback) => callback.onSuccess(data.accessToken));
      pendingQueue = [];

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return axiosClient(originalRequest);
    } catch (refreshError) {
      // Refresh token cũng hết hạn/không hợp lệ -> bắt buộc đăng nhập lại
      pendingQueue.forEach((callback) => callback.onError(refreshError));
      pendingQueue = [];
      store.dispatch(logout());
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  });

export default axiosClient;
