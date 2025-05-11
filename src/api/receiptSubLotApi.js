import axiosClient from "./axiosClient";


const receiptSubLotApi = {


    updateReceiptSubLot(data) {
        const url = 'InventoryReceiptSublot/UpdateReceiptSublot';
        return axiosClient.put(url, data)
    }

    
};

export default receiptSubLotApi;