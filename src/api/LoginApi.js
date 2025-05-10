import axiosClient from "./axiosClient";
const LoginApi = {
    getAllUser(userName, password) {
        const params = new URLSearchParams();
        const url = `User/CheckUserSignIn?userName=${userName}&password=${password}`;
        return axiosClient.get(url, {params});
    }
};
export default LoginApi;