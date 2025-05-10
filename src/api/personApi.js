import axiosClient from "./axiosClient";
const personApi = {
    getAllPerson(params) {
        const url = 'Person/GetAllPeople';
        return axiosClient.get(url, {params});
    },
    createPerson(data) {
        const url = 'Person/CreateNewPerson'; // Ensure this matches the API endpoint
        return axiosClient.post(url, data); // POST request for creating a person
    }
};
export default personApi;