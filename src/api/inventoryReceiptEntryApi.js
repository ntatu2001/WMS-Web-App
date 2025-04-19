
import axiosClient from "./axiosClient";


const inventoryReceiptEntryApi = {
    getAllReceiptEntries(params) {
        const url = 'InventoryReceiptEntry/GetAllReceiptEntries';
        return axiosClient.get(url, {params});
    },
    
    getReceiptEntryById(id) {
        const url = `InventoryReceiptEntry/GetReceiptEntryById/${id}`;
        return axiosClient.get(url);
    }
};

export default inventoryReceiptEntryApi;