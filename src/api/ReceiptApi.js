import axiosClient from "./axiosClient";

const ReceiptApi = {
    getAllReceipt(lotNumber, supplierId = "", startTime = "", endTime = "") {
        const params = new URLSearchParams();
        params.append("lotNumber", lotNumber || "");
        params.append("supplierId", supplierId);
        params.append("startTime", startTime);
        params.append("endTime", endTime);

        const url = `InventoryLog/GetAllReceiptLotsTracking?${params.toString()}`;
        return axiosClient.get(url);
    },
};

export default ReceiptApi;