import axiosClient from "./axiosClient";

const materialClassApi = {
    getAllMaterialClass(params) {
        const url = 'MaterialClass/GetAllMaterialClass';
        return axiosClient.get(url, {params});
    },

    getAllMaterialClassNameId(params) {
        const url = 'MaterialClass/GetAllMaterialClassNameId';
        return axiosClient.get(url, {params});
    }
};


export default materialClassApi;