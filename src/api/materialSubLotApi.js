import axiosClient from "./axiosClient";

const materialSubLotApi = {
    getMaterialSubLotsByLotNumber(id) {
        const url = `MaterialSubLot/GetMaterialSubLotsByLotNumber/${id}`; // Ensure this endpoint exists in your backend
        return axiosClient.get(url);
    }
};


export default materialSubLotApi;