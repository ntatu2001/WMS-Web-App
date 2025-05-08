import axiosClient from "./axiosClient";

const receiptLotApi = {
    getAllReceiptLots(params) {
        const url = 'InventoryReceiptLot/GetAllReceiptLots';
        return axiosClient.get(url, {params});
    },

    getReceiptLotByNotDone(id) {
        const url = `InventoryReceiptLot/GetReceiptLotByNotDone?warehouseId=${id}`;
        return axiosClient.get(url);
    }
};


export default receiptLotApi;