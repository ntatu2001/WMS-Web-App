import axiosClient from "./axiosClient";

const IssueApi = {
    getAllIssue(lotNumber, supplierId = "", startTime = "", endTime = "") {
        const params = new URLSearchParams();

        params.append("lotNumber", lotNumber || "");
        params.append("supplierId", supplierId);
        params.append("startTime", startTime);
        params.append("endTime", endTime);

        const url = `InventoryLog/GetAllIssueLotsTracking?${params.toString()}`;
        return axiosClient.get(url);
    },
};

export default IssueApi;