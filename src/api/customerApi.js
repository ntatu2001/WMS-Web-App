import axiosClient from "./axiosClient";

const customerApi = {
    getAllCustomers(params) {
        const url = 'Customer/GetAllCustomers';
        return axiosClient.get(url, {params});
    }
};


export default customerApi;