import axiosClient from "./axiosClient";

const materiaLotApi = {
    GetMaterialLotsByMaterialId(id) {
        const url = `MaterialLot/GetMaterialLotsByMaterialId/${id}`;
        return axiosClient.get(url);
    }
};


export default materiaLotApi;