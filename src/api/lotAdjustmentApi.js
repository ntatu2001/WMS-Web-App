import axiosClient from "./axiosClient";


const lotAdjustmentApi = {

    createNewStockTake(data) {
        const url = 'StockTake/CreateNewStockTake';
        return axiosClient.post(url, data)
    }


};

export default lotAdjustmentApi;
