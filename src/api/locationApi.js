
import axiosClient from "./axiosClient";


const locationApi = {

    GetLocationsByWarehouseId(id) {
        const url = `Location/GetLocationsByWarehouseId/${id}`;
        return axiosClient.get(url);
    },

    GetInforByLocationId(id) {
        const url = `Location/GetInforByLocationId/${id}`;
        return axiosClient.get(url);
    },

    getStockLocationHistoriesByLocationId(id, startTime, endTime) {
        const url = `Location/GetStockLocationHistoriesByLocationId?locationId=${id}&startTime=${startTime}&endTime=${endTime}`;
        return axiosClient.get(url);
    }

};

export default locationApi;