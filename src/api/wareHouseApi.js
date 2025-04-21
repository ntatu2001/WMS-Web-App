import axiosClient from "./axiosClient";

const wareHouseApi = {
    getAllWareHouses(params) {
        const url = 'Warehouse/GetAllWarehouses';
        return axiosClient.get(url, {params});
    }
};


export default wareHouseApi;