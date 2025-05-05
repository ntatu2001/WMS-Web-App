import axiosClient from "./axiosClient";


const lotAdjustmentApi = {

    createNewMaterialLotAdjustment(data) {
        const url = 'MaterialLotAdjustment/CreateNewMaterialLotAdjustment';
        return axiosClient.post(url, data)
    },

    updateMaterialLotAdjustment(data) {
        const url = 'MaterialLotAdjustment/UpdateMaterialLotAdjustmentCommand';
        return axiosClient.put(url, data)
    }

    
};

export default lotAdjustmentApi;