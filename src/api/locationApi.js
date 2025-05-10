import axiosClient from "./axiosClient";
const locationApi = {
    getAllLocation(params) {
        const url = 'Location/GetLocationById/';
        return axiosClient.get(url, {params});
    },
    createLocation(data) {
        const url = 'Location/CreateNewLocation'; // Ensure this matches the API endpoint
        return axiosClient.post(url, data); // POST request for creating a person
    }
};
export default locationApi;