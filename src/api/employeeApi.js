import axiosClient from "./axiosClient";

const employeeApi = {
    getAllEmployees(params) {
        const url = 'Employee/GetAllEmployees';
        return axiosClient.get(url, {params});
    },
    createEmployee(data) {
        const url = 'Employee/CreateNewEmployee';
        return axiosClient.post(url, data);
    }
};

export default employeeApi;
