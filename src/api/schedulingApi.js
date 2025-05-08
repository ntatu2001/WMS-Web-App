import axiosAlgorithm from "./axiosAlgorithm";
    
    const schedulingApi = {
        getReceiptDetailScheduling(id) {
            const url = `ReceiptScheduling/GetReceiptDetailScheduling?warehouseId=${id}`; // Ensure this endpoint exists in your backend
            return axiosAlgorithm.get(url);
        },

        getReceiptLayoutScheduling(id) {
            const url = `ReceiptScheduling/GetReceiptLayoutScheduling?warehouseId=${id}`; // Ensure this endpoint exists in your backend
            return axiosAlgorithm.get(url);
        },
        
        getIssueDetailScheduling(id) {
            const url = `IssueScheduling/GetIssueDetailScheduling?warehouseId=${id}`; // Ensure this endpoint exists in your backend
            return axiosAlgorithm.get(url);
        },

        getIssueLayoutScheduling(id) {
            const url = `IssueScheduling/GetIssueLayoutScheduling?warehouseId=${id}`; // Ensure this endpoint exists in your backend
            return axiosAlgorithm.get(url);
        },
    }

    export default schedulingApi;