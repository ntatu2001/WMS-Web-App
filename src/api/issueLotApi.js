import axiosClient from "./axiosClient";

const issueLotApi = {
    getAllIssueLots(params) {
        const url = 'InventoryIssueLot/GetAllIssueLots';
        return axiosClient.get(url, {params});
    },

    getIssueLotsPending(id) {
        const url = `InventoryIssueLot/GetIssueLotsPending?warehouseId=${id}`;
        return axiosClient.get(url);
    },

    updateIssueLotStatus(issueLotStatus) {
        const url = 'InventoryIssueLot/UpdateIssueLotStatus';
        return axiosClient.put(url, issueLotStatus);
    }
};


export default issueLotApi;