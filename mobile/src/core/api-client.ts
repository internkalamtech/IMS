// src/core/api-client.ts

import axios, { AxiosInstance } from "axios";
import { Platform } from "react-native";

// 🔹 Default API URL (works for web/iOS simulator)
let API_URL = "http://localhost:8000/api/v1";

// 🔹 Android emulator needs 10.0.2.2
if (Platform.OS === "android") {
  API_URL = "http://10.0.2.2:8000/api/v1";
}

// ✅ Create Axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with a status code outside 2xx
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // No response received
      return Promise.reject({
        detail: "No response received from server. Check your network or backend URL.",
      });
    } else {
      // Something else happened
      return Promise.reject({
        detail: "Request setup error: " + error.message,
      });
    }
  }
);

// ✅ Export the instance properly
export default axiosInstance;
