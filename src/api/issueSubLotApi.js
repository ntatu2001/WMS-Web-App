import axiosClient from "./axiosClient";


const issueSubLotApi = {


    updateIssueSubLot(data) {
        const url = 'InventoryIssueSubLot/UpdateIssueSubLot';
        return axiosClient.put(url, data)
    }

    
};

export default issueSubLotApi;