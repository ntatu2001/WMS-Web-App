import axiosClient from "./axiosClient";

const InventoryApi = {
    getAllAdjustment(lotNumber, supplierId = "", startTime = "", endTime = "") {
        const params = new URLSearchParams();

        params.append("lotNumber", lotNumber || "");
        params.append("startTime", startTime);
        params.append("endTime", endTime);

        const url = `InventoryLog/GetLotAdjustmentsTracking?${params.toString()}`;
        return axiosClient.get(url);
    },
};

export default InventoryApi;