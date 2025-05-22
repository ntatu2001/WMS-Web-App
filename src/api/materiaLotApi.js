import axiosClient from "./axiosClient";

const materiaLotApi = {

    getAllMaterialLots(params) {
        const url = 'MaterialLot/GetAllMaterialLots'; // Ensure this endpoint exists in your backend
        return axiosClient.get(url, { params });
    },

    getMaterialLotById(id) {
        const url = `MaterialLot/GetMaterialLotById/${id}`; // Ensure this endpoint exists in your backend
        return axiosClient.get(url);
    },

    GetMaterialLotsByMaterialId(id) {
        const url = `MaterialLot/GetMaterialLotsByMaterialId/${id}`;
        return axiosClient.get(url);
    },

    GetQuantityByMaterialLotId(id) {
        const url = `MaterialLot/GetQuantityByMaterialLotId/${id}`;
        return axiosClient.get(url);
    }
};


export default materiaLotApi;