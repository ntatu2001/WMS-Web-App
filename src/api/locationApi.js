
import axiosClient from "./axiosClient";


const locationApi = {

    getAllLocations(params) {
        const url = 'Location/GetAllLocations';
        return axiosClient.get(url, {params});
    },

    createLocation(data) {
        const url = 'Location/CreateNewLocation';
        return axiosClient.post(url, data);
    },

    getLocationById(id) {
        const url = `Location/GetLocationById/${id}`;
        return axiosClient.get(url);
    },

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