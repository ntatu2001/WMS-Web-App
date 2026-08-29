import axiosClient from "./axiosClient";


const inventoryReceiptEntryApi = {
    getReceiptEntriesNotPendingByDate(fromDate, toDate, warehouseName, pageNumber, pageSize) {
        const url = 'InventoryReceiptEntry/GetReceiptEntriesNotPendingByDate';
        return axiosClient.get(url, {params: {fromDate, toDate, warehouseName, pageNumber, pageSize}});
    },

    getReceiptEntriesByLotNumber(lotNumber, materialName, warehouseName, pageNumber, pageSize) {
        const url = 'InventoryReceiptEntry/GetReceiptEntriesByLotNumber';
        return axiosClient.get(url, {params: {lotNumber, materialName, warehouseName, pageNumber, pageSize}});
    },

    getReceiptEntryById(id) {
        const url = `InventoryReceiptEntry/GetReceiptEntryById/${id}`;
        return axiosClient.get(url);
    },

};

export default inventoryReceiptEntryApi;