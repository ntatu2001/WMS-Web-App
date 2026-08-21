
import axiosClient from "./axiosClient";


const inventoryIssueEntryApi = {
    getIssueEntriesByDate(fromDate, toDate, warehouseName) {
        const url = 'InventoryIssueEntry/GetIssueEntriesByDate';
        return axiosClient.get(url, {params: {fromDate, toDate, warehouseName}});
    },
    
    getIssueEntryById(id) {
        const url = `InventoryIssueEntry/GetIssueEntryById/${id}`;
        return axiosClient.get(url);
    }
};

export default inventoryIssueEntryApi;