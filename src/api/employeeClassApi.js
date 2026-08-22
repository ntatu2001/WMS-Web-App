import axiosClient from "./axiosClient";

const employeeClassApi = {
    getAllEmployeeClasses(params) {
        const url = 'EmployeeClass/GetAllEmployeeClasses';
        return axiosClient.get(url, {params});
    },

    getAllEmployeeClassNameId(params) {
        const url = 'EmployeeClass/GetAllEmployeeClassNameId';
        return axiosClient.get(url, {params});
    },

    getEmployeeClassById(id) {
        const url = `EmployeeClass/GetEmployeeClassById/${id}`;
        return axiosClient.get(url);
    }
};

export default employeeClassApi;
