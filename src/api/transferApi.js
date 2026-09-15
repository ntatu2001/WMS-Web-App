import axiosClient from "./axiosClient";

const transferApi = {
    createTransfer(data) {
        const url = 'Transfer/CreateTransfer';
        return axiosClient.post(url, data);
    },

    getAllTransfers(params) {
        const url = 'Transfer/GetAllTransfers';
        return axiosClient.get(url, { params });
    },

    getTransferById(id) {
        const url = `Transfer/GetTransferById/${id}`;
        return axiosClient.get(url);
    },

    confirmDeparture(id) {
        const url = `Transfer/ConfirmDeparture/${id}`;
        return axiosClient.put(url);
    },

    confirmArrival(data) {
        const url = 'Transfer/ConfirmArrival';
        return axiosClient.put(url, data);
    },

    cancelTransfer(id, reason) {
        const url = `Transfer/CancelTransfer/${id}`;
        return axiosClient.put(url, { reason });
    }
};

export default transferApi;
