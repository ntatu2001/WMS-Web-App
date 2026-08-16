
import axiosClient from "./axiosClient";


const inventoryIssueEntryApi = {
    getIssueEntriesByDate(fromDate, toDate) {
        const url = 'InventoryIssueEntry/GetIssueEntriesByDate';
        return axiosClient.get(url, {params: {fromDate, toDate}});
    },
    
    getIssueEntryById(id) {
        const url = `InventoryIssueEntry/GetIssueEntryById/${id}`;
        return axiosClient.get(url);
    }
};

export default inventoryIssueEntryApi;