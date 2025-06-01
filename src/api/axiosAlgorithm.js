import axios from 'axios';

const axiosAlgorithm = axios.create ({
    baseURL: 'https://slapscheduling20250601103452.azurewebsites.net/api/',
    // baseURL: 'https://67cebcbb125cd5af757bc819.mockapi.io/test/van/',
    headers : {
      'Content-Type' : 'application/json',
    },
});

// Interceptors

// Add a request interceptor
axiosAlgorithm.interceptors.request.use(function (config) {
    // Do something before request is sent
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });

// Add a response interceptor
axiosAlgorithm.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response.data;
  }, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  });

export default axiosAlgorithm;