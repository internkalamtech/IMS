import axios from "axios";

// ✅ FIXED BASE URL (temporary direct URL)
const API = "http://127.0.0.1:8000/api/v1/homeworks";

const apiClient = axios.create({
  baseURL: API,
});

// ✅ GET
export const getHomeworks = async () => {
  try {
    const res = await apiClient.get("/");
    return res.data;
  } catch (error) {
    console.log("GET error:", error);
    return [];
  }
};

// ✅ CREATE
export const createHomework = async (data: any) => {
  try {
    const res = await apiClient.post("/", data);
    return res.data;
  } catch (error) {
    console.log("POST error:", error);
    throw error;
  }
};

// ✅ UPDATE
export const updateHomework = async (id: string, data: any) => {
  try {
    const res = await apiClient.put(`/${id}`, data);
    return res.data;
  } catch (error) {
    console.log("PUT error:", error);
    throw error;
  }
};

// ✅ DELETE
export const deleteHomework = async (id: string) => {
  try {
    console.log("DELETE API CALL:", id);

    const res = await apiClient.delete(`/${id}`);

    console.log("DELETE SUCCESS:", res.data);

    return res.data;
  } catch (error: any) {
    console.log(
      "DELETE ERROR:",
      error?.response?.status,
      error?.response?.data || error.message
    );
    throw error;
  }
};