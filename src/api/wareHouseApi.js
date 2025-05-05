import axiosClient from "./axiosClient";

const wareHouseApi = {
    getAllWareHouses(params) {
        const url = 'Warehouse/GetAllWarehouses';
        return axiosClient.get(url, {params});
    },

    getWarehouseIdByWarehouseName(name) {
        const url = `Warehouse/GetWarehouseIdByWarehouseName/${name}`;
        return axiosClient.get(url);
    }
};


export default wareHouseApi;