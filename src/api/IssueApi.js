import axiosClient from "./axiosClient";

const IssueApi = {
    getAllIssue(lotNumber, customerName = "", startTime = "", endTime = "") {
        const params = new URLSearchParams();

        params.append("lotNumber", lotNumber || "");
        params.append("customerName", customerName);
        params.append("startTime", startTime);
        params.append("endTime", endTime);

        const url = `InventoryLog/GetAllIssueLotsTracking?${params.toString()}`;
        return axiosClient.get(url);
    },
};

export default IssueApi;