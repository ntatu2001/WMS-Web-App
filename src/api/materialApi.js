import axiosClient from "./axiosClient";

const materialApi = {
    getAllMaterials(params) {
        const url = 'Material/GetAllMaterials'; // Ensure this endpoint exists in your backend
        return axiosClient.get(url, { params });
    },

    getMaterialsByWarehouseId(id) {
        const url = `Material/GetMaterialsByWarehouseId/${id}`; // Ensure this endpoint exists in your backend
        return axiosClient.get(url);
    },

    getMaterialsByWarehouseIdAndMaterialLot(id) {
        const url = `Material/GetMaterialsByWarehouseIdAndMaterialLot/${id}`; // Ensure this endpoint exists in your backend
        return axiosClient.get(url);
    },

    getMaterialById(id) {
        const url = `Material/GetMaterialById/${id}`; // Ensure this endpoint exists in your backend
        return axiosClient.get(url);
    },

    createMaterial(data) {
        const url = 'Material/CreateMaterial'; // Ensure this endpoint exists in your backend
        return axiosClient.post(url, data);
    },

    getUnitByMaterialId(id) {
        const url = `Material/GetUnitByMaterialId/${id}`; // Ensure this endpoint exists in your backend
        return axiosClient.get(url);
    },
   
};

export default materialApi;


