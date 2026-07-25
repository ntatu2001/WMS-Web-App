import axiosClient from "./axiosClient";

const materialSubLotApi = {
    getMaterialSubLotsByLotNumber(id) {
        const url = `MaterialSubLot/GetMaterialSubLotsByLotNumber/${id}`; // Ensure this endpoint exists in your backend
        return axiosClient.get(url);
    },

    updateMaterialSubLot(data) {
        const url = 'MaterialSubLot/UpdateMaterialSubLot';
        return axiosClient.put(url, data);
    }
};


export default materialSubLotApi;