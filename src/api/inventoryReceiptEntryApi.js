import axiosClient from "./axiosClient";


const inventoryReceiptEntryApi = {
    getReceiptEntriesByDate(fromDate, toDate, warehouseName) {
        const url = 'InventoryReceiptEntry/GetReceiptEntriesByDate';
        return axiosClient.get(url, {params: {fromDate, toDate, warehouseName}});
    },
    
    getReceiptEntryById(id) {
        const url = `InventoryReceiptEntry/GetReceiptEntryById/${id}`;
        return axiosClient.get(url);
    },
    
};

export default inventoryReceiptEntryApi;