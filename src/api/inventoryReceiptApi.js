
import axiosClient from "./axiosClient";


const inventoryReceiptApi = {
    getAllReceipts(params) {
        const url = 'inventoryReceiptApi';
        return axiosClient.get(url, {params});
    },
    
    getReceiptById(id) {
        const url = `InventoryReceipt/GetAllReceipts/${id}`;
        return axiosClient.get(url);
    },

    createReceipt(data) {
        const url = 'InventoryReceipt/CreateReceipt';
        return axiosClient.post(url, data)
    }

   
};

export default inventoryReceiptApi;