import axiosClient from "./axiosClient";

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

// Giải mã role trực tiếp từ payload JWT (không cần thư viện jwt-decode)
export function decodeRoles(accessToken) {
    if (!accessToken) return [];
    try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const roleClaim = payload[ROLE_CLAIM];
        if (!roleClaim) return [];
        return Array.isArray(roleClaim) ? roleClaim : [roleClaim];
    } catch (error) {
        console.error('Error decoding JWT roles:', error);
        return [];
    }
}

// Claim "employeeId" là claim tuỳ biến (không phải ClaimTypes chuẩn) nên giữ nguyên key ngắn, không cần URI schema
export function decodeEmployeeId(accessToken) {
    if (!accessToken) return null;
    try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        return payload.employeeId || null;
    } catch (error) {
        console.error('Error decoding JWT employeeId:', error);
        return null;
    }
}

const authApi = {
    login(userName, password) {
        const url = 'Auth/Login';
        return axiosClient.post(url, { userName, password });
    },

    refresh(refreshToken) {
        const url = 'Auth/Refresh';
        return axiosClient.post(url, { refreshToken });
    },

    logout(refreshToken) {
        const url = 'Auth/Logout';
        return axiosClient.post(url, { refreshToken });
    },

    createUser(data) {
        const url = 'Auth/CreateUser';
        return axiosClient.post(url, data);
    }
};

export default authApi;
