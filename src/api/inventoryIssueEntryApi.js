
import axiosClient from "./axiosClient";


const inventoryIssueEntryApi = {
    getAllIssueEntries(params) {
        const url = 'InventoryIssueEntry/GetAllIssueEntries';
        return axiosClient.get(url, {params});
    },
    
    getIssueEntryById(id) {
        const url = `InventoryIssueEntry/GetIssueEntryById/${id}`;
        return axiosClient.get(url);
    }
};

export default inventoryIssueEntryApi;