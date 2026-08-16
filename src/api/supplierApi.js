import axiosClient from "./axiosClient";

const supplierApi = {
    getAllSupplier(params) {
        const url = 'Supplier/GetAllSupplier';
        return axiosClient.get(url, {params});
    },
    getAllSupplierNameId(params) {
        const url = 'Supplier/GetAllSupplierNameId';
        return axiosClient.get(url, {params});
    }
};


export default supplierApi;