
import axiosClient from "./axiosClient";

const AccountApi = {
    GetAccountInfo(userName) {
        const url = `User/GetPersonInforByUserName/${userName}`;
        return axiosClient.get(url);
    }
};


export default AccountApi;