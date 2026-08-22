import axiosClient from "./axiosClient";

const employeeApi = {
    getAllEmployees(params) {
        const url = 'Employee/GetAllEmployees';
        return axiosClient.get(url, {params});
    },
    searchEmployeesByEmployeeId(employeeId, employeeClassId, pageNumber, itemsPerPage) {
        const url = 'Employee/SearchEmployeesByEmployeeId';
        return axiosClient.get(url, { params: { employeeId, employeeClassId, pageNumber, itemsPerPage } });
    },
    getAllEmployeeNameId(params) {
        const url = 'Employee/GetAllEmployeeNameId';
        return axiosClient.get(url, {params});
    },
    createEmployee(data) {
        const url = 'Employee/CreateNewEmployee';
        return axiosClient.post(url, data);
    }
};

export default employeeApi;
