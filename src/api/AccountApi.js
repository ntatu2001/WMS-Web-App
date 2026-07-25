
import axiosClient from "./axiosClient";

const AccountApi = {
    GetAccountInfo(employeeId) {
        const url = `Employee/GetEmployeeById/${employeeId}`;
        return axiosClient.get(url);
    }
};


export default AccountApi;