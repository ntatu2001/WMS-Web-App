import axiosClient from "./axiosClient";

const receiptLotApi = {
    getAllReceiptLots(params) {
        const url = 'InventoryReceiptLot/GetAllReceiptLots';
        return axiosClient.get(url, {params});
    }
};


export default receiptLotApi;