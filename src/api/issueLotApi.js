import axiosClient from "./axiosClient";

const issueLotApi = {
    getAllIssueLots(params) {
        const url = 'InventoryIssueLot/GetAllIssueLots';
        return axiosClient.get(url, {params});
    }
};


export default issueLotApi;