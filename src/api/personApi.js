import axiosClient from "./axiosClient";

const personApi = {
    getAllPeople(params) {
        const url = 'Person/GetAllPeople';
        return axiosClient.get(url, {params});
    }
};


export default personApi;