import axiosClient from "./axiosClient";
const overViewApi = {
    getOverViewById(id) {
        const url = `Overview/GetInventoryActivityStats?timeRangeOption=${id}`; // Ensure this endpoint exists in your backend
        return axiosClient.get(url);
    },
    getInventoryActivityStats(newid) {
        const url = `Overview/GetWarehouseInventoryMovementStats?timeRangeOption=${newid}`; // Ensure this endpoint exists in your backend
        return axiosClient.get(url);
    }
};
export default overViewApi;