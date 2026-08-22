
import axiosClient from "./axiosClient";


const inventoryIssueEntryApi = {
    getIssueEntriesByDate(fromDate, toDate, warehouseName, pageNumber, pageSize) {
        const url = 'InventoryIssueEntry/GetIssueEntriesByDate';
        return axiosClient.get(url, {params: {fromDate, toDate, warehouseName, pageNumber, pageSize}});
    },

    getIssueEntriesByLotNumber(lotNumber, materialName, warehouseName, pageNumber, pageSize) {
        const url = 'InventoryIssueEntry/GetIssueEntriesByLotNumber';
        return axiosClient.get(url, {params: {lotNumber, materialName, warehouseName, pageNumber, pageSize}});
    },

    getIssueEntryById(id) {
        const url = `InventoryIssueEntry/GetIssueEntryById/${id}`;
        return axiosClient.get(url);
    }
};

export default inventoryIssueEntryApi;