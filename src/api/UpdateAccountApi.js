import axiosClient from "./axiosClient";

const UpdateAccountApi = {
    updateAccountById(params) {
        const url = `Person/UpdatePerson`; // Correct endpoint
        return axiosClient.put(url, params); // Use PUT and include params
    }
};

export default UpdateAccountApi;