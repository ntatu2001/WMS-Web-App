import axiosClient from "./axiosClient";

const materialClassApi = {
    getAllMaterialClass(params) {
        const url = 'MaterialClass/GetAllMaterialClass';
        return axiosClient.get(url, {params});
    }
};


export default materialClassApi;