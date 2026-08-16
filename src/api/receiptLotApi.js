import axiosClient from "./axiosClient";

const receiptLotApi = {
    getAllReceiptLots(params) {
        const url = 'InventoryReceiptLot/GetAllReceiptLots';
        return axiosClient.get(url, {params});
    },

    getAllReceiptLotIds(params) {
        const url = 'InventoryReceiptLot/GetAllReceiptLotIds';
        return axiosClient.get(url, {params});
    },

    getReceiptLotsPending(id) {
        const url = `InventoryReceiptLot/GetReceiptLotsPending?warehouseId=${id}`;
        return axiosClient.get(url);
    },

    updateReceiptLotStatus(data) {
        const url = 'InventoryReceiptLot/UpdateReceiptLotStatus';
        return axiosClient.put(url, data);
    }
};


export default receiptLotApi;