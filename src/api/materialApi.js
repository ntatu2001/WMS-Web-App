import axiosClient from "./axiosClient";

const materialApi = {
    getAllMaterials(params) {
        const url = 'Material/GetAllMaterials';
        return axiosClient.get(url, {params});
    },

    getMaterialsByWarehouseId(id) {
        const url = `Material/GetMaterialsByWarehouseId/${id}`;
        return axiosClient.get(url);
    },

    getUnitByMaterialId (id) {
        const url = `Material/GetUnitByMaterialId/${id}`;
        return axiosClient.get(url);
    }
};


export default materialApi;


