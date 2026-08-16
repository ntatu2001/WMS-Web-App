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

    getMaterialIdByLotNumber(lotNumber) {
        const url = `MaterialLot/GetMaterialIdByLotNumber/${lotNumber}`;
        return axiosClient.get(url);
    },

    GetMaterialLotsByMaterialId(id) {
        const url = `MaterialLot/GetMaterialLotsByMaterialId/${id}`;
        return axiosClient.get(url);
    },

    GetLotNumbersByMaterialId(id) {
        const url = `MaterialLot/GetLotNumbersByMaterialId/${id}`;
        return axiosClient.get(url);
    },

    GetQuantityByMaterialLotId(id) {
        const url = `MaterialLot/GetQuantityByMaterialLotId/${id}`;
        return axiosClient.get(url);
    },

    GetMaterialLotsByWarehouseId(id) {
        const url = `MaterialLot/GetMaterialLotsByWarehouseId/${id}`;
        return axiosClient.get(url);
    },

    GetLotNumbersByWarehouseId(id) {
        const url = `MaterialLot/GetLotNumbersByWarehouseId/${id}`;
        return axiosClient.get(url);
    }
};


export default materiaLotApi;