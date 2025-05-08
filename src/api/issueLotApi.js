import axiosClient from "./axiosClient";

const issueLotApi = {
    getAllIssueLots(params) {
        const url = 'InventoryIssueLot/GetAllIssueLots';
        return axiosClient.get(url, {params});
    },

    getIssueLotsNotDone(id) {
        const url = `InventoryIssueLot/GetIssueLotsNotDone?warehouseId=${id}`;
        return axiosClient.get(url);
    }
};


export default issueLotApi;