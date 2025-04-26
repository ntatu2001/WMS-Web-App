import axiosClient from "./axiosClient";
const personApi = {
    getAllPerson(params) {
        const url = 'Person/GetAllPeople';
        return axiosClient.get(url, {params});
    }
};
export default personApi;