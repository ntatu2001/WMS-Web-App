import axiosClient from "./axiosClient";

const UpdateAccountApi = {
    updateAccountById(params) {
        const url = `Employee/UpdateEmployee`;
        return axiosClient.put(url, params);
    }
};

export default UpdateAccountApi;