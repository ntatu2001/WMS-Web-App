import axiosClient from "./axiosClient";
const personApi = {
    getAllperson(params) {
        const url = 'person/GetAllpeople';
        return axiosClient.get(url, {params});
    }
};
export default personApi;