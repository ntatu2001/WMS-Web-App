import axiosClient from "./axiosClient";


const lotAdjustmentApi = {

    createNewStockTake(data) {
        const url = 'StockTake/CreateNewStockTake';
        return axiosClient.post(url, data)
    },

    updateStockTake(data) {
        const url = 'StockTake/UpdateStockTakeCommand';
        return axiosClient.put(url, data)
    }


};

export default lotAdjustmentApi;
