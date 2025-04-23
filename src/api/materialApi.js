import axiosClient from "./axiosClient";

const materialApi = {
    getAllMaterials(params) {
        const url = 'Material/GetAllMaterials';
        return axiosClient.get(url, {params});
    }
};


export default materialApi;