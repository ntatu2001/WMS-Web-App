
import axiosClient from "./axiosClient";


const inventoryIssueApi = {
    getAllIssues(params) {
        const url = 'InventoryIssue/GetAllIssues';
        return axiosClient.get(url, {params});
    },
    
    getIssueById(id) {
        const url = `InventoryIssue/GetAllIssues/${id}`;
        return axiosClient.get(url);
    },

    createIssue(data) {
        const url = 'InventoryIssue/CreateInventoryIssue';
        return axiosClient.post(url, data)
    }

   
};

export default inventoryIssueApi;