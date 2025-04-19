
import axiosClient from "./axiosClient";


const inventoryReceiptApi = {
    getAllReceipts(params) {
        const url = 'InventoryReceipt/GetAllReceipts';
        return axiosClient.get(url, {params});
    },
    
    getReceiptById(id) {
        const url = `InventoryReceipt/GetAllReceipts/${id}`;
        return axiosClient.get(url);
    }
};

export default inventoryReceiptApi;